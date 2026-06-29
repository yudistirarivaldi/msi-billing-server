'use strict';

const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const csv = require('fast-csv');
const { Sequelize } = require('sequelize');
const db = require('./models');
const BillingService = require('./billingService');

// Configuration
const CONFIG = {
  incomingFolder: path.join(__dirname, 'uploads', 'cdr', 'incoming'),
  successFolder: path.join(__dirname, 'uploads', 'cdr', 'success_import'),
  failedFolder: path.join(__dirname, 'uploads', 'cdr', 'failed_import'),
  supportedExtensions: ['.csv', '.txt'],
  batchDelay: 1000
};

// Logger utility
const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`, error ? error.stack || error : '');
  },
  watcher: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [WATCHER] ${message}`);
  },
  processing: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [PROCESSING] ${message}`);
  },
  success: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SUCCESS] ${message}`);
  }
};

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.ensureDir(CONFIG.incomingFolder);
    await fs.ensureDir(CONFIG.successFolder);
    await fs.ensureDir(CONFIG.failedFolder);
    logger.info('Directories ensured');
  } catch (error) {
    logger.error('Failed to create directories', error);
    throw error;
  }
}

// Helper function to safely parse integers
function safeParseInt(value, defaultValue = null) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to clean string values
function cleanString(value, defaultValue = '') {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value).trim();
}

// Escape SQL values to prevent injection
function escapeSqlString(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return `'${String(value).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

// Normalize CUCM timestamp to JavaScript Date
function normalizeTimestamp(timestamp) {
  if (!timestamp) return new Date();
  
  const parsed = safeParseInt(timestamp);
  if (parsed !== null) {
    if (parsed < 10000000000) {
      return new Date(parsed * 1000);
    } else {
      return new Date(parsed);
    }
  }
  
  const dateObj = new Date(timestamp);
  return isNaN(dateObj.getTime()) ? new Date() : dateObj;
}

// Determine call type based on number patterns
function determineCallType(callingNumber, calledNumber) {
  const calling = cleanString(callingNumber);
  const called = cleanString(calledNumber);
  
  // Skip if numbers are empty
  if (!calling || !called) {
    return 'Unknown';
  }
  
  // Internal calls (same prefix/extension length)
  if (calling.length === called.length && calling.length <= 4) {
    return 'Internal';
  }
  
  // Mobile numbers (Indonesia: 08xx)
  if (called.startsWith('08')) {
    return 'National';
  }
  
  // International (00 or + prefix)
  if (called.startsWith('00') || called.startsWith('+')) {
    return 'International';
  }
  
  // Default to National
  return 'National';
}

// Process a single CSV file
async function processFile(filePath) {
  const fileName = path.basename(filePath);
  logger.processing(`Starting to process file: ${fileName}`);
  
  let transaction;
  let processedRows = 0;
  let errorRows = 0;
  
  try {
    transaction = await db.sequelize.transaction();
    
    // Use a promise to handle the stream with for await
    const processStream = async () => {
      try {
        // Detect delimiter by reading the first line
        const firstLine = await new Promise((resolve) => {
          const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
          let line = '';
          stream.on('data', (chunk) => {
            line += chunk;
            if (line.includes('\n')) {
              stream.destroy();
              resolve(line.split('\n')[0]);
            }
          });
          stream.on('end', () => resolve(line));
        });

        const delimiter = firstLine.includes(';') ? ';' : ',';
        logger.info(`Detected delimiter for ${fileName}: "${delimiter}"`);

        const readStream = fs.createReadStream(filePath);
        const csvStream = csv.parse({ 
          headers: true, 
          ignoreEmpty: true,
          skipLines: 0,
          trim: true,
          delimiter: delimiter
        });

        readStream.pipe(csvStream);

        for await (const row of csvStream) {
          try {
            logger.processing(`Importing row ${processedRows + 1}: ${cleanString(row.globalCallID_callId, 'N/A')}`);
            
            // Prepare data and insert into cdr_raw (using raw SQL like before to maintain compatibility)
            const rawData = {
              cdrRecordType: safeParseInt(row.cdrRecordType),
              globalCallID_callManagerId: safeParseInt(row.globalCallID_callManagerId),
              globalCallId: cleanString(row.globalCallID_callId),
              origLegCallIdentifier: cleanString(row.origLegCallIdentifier),
              dateTimeOrigination: safeParseInt(row.dateTimeOrigination, Date.now()),
              origNodeId: safeParseInt(row.origNodeId),
              origSpan: safeParseInt(row.origSpan),
              origIpAddr: cleanString(row.origIpAddr),
              callingPartyNumber: cleanString(row.callingPartyNumber),
              callingPartyUnicodeLoginUserID: cleanString(row.callingPartyUnicodeLoginUserID),
              origCause_location: cleanString(row.origCause_location),
              origCause_value: safeParseInt(row.origCause_value),
              origPrecedenceLevel: cleanString(row.origPrecedenceLevel),
              origMediaTransportAddress_IP: cleanString(row.origMediaTransportAddress_IP),
              origMediaTransportAddress_Port: safeParseInt(row.origMediaTransportAddress_Port),
              // ... and so on ...
            };

            // Re-using the interpolation logic for cdr_raw
            const cdrRawSQL = `
              INSERT INTO "cdr_raw" (
                "cdrRecordType", "globalCallID_callManagerId", "globalCallId", "origLegCallIdentifier", 
                "dateTimeOrigination", "origNodeId", "origSpan", "origIpAddr", "callingPartyNumber", 
                "callingPartyUnicodeLoginUserID", "origCause_location", "origCause_value", "origPrecedenceLevel", 
                "origMediaTransportAddress_IP", "origMediaTransportAddress_Port", "origMediaCap_payloadCapability", 
                "origMediaCap_maxFramesPerPacket", "origMediaCap_g723BitRate", "origVideoCap_Codec", 
                "origVideoCap_Bandwidth", "origVideoCap_Resolution", "origVideoTransportAddress_IP", 
                "origVideoTransportAddress_Port", "origRSVPAudioStat", "origRSVPVideoStat", "destLegIdentifier", 
                "destNodeId", "destSpan", "destIpAddr", "originalCalledPartyNumber", "finalCalledPartyNumber", 
                "finalCalledPartyUnicodeLoginUserID", "destCause_location", "destCause_value", "destPrecedenceLevel", 
                "destMediaTransportAddress_IP", "destMediaTransportAddress_Port", "destMediaCap_payloadCapability", 
                "destMediaCap_maxFramesPerPacket", "destMediaCap_g723BitRate", "destVideoCap_Codec", 
                "destVideoCap_Bandwidth", "destVideoCap_Resolution", "destVideoTransportAddress_IP", 
                "destVideoTransportAddress_Port", "destRSVPAudioStat", "destRSVPVideoStat", "dateTimeConnect", 
                "dateTimeDisconnect", "lastRedirectDn", "pkid", "originalCalledPartyNumberPartition", 
                "callingPartyNumberPartition", "finalCalledPartyNumberPartition", "lastRedirectDnPartition", 
                "duration", "origDeviceName", "destDeviceName", "origCallTerminationOnBehalfOf", 
                "destCallTerminationOnBehalfOf", "origCalledPartyRedirectOnBehalfOf", "lastRedirectRedirectOnBehalfOf", 
                "origCalledPartyRedirectReason", "lastRedirectRedirectReason", "destConversationId", 
                "globalCallId_ClusterID", "joinOnBehalfOf", "comment", "authCodeDescription", 
                "authorizationLevel", "clientMatterCode", "origDTMFMethod", "destDTMFMethod", 
                "callSecuredStatus", "origConversationId", "origMediaCap_Bandwidth", "destMediaCap_Bandwidth", 
                "authorizationCodeValue", "outpulsedCallingPartyNumber", "outpulsedCalledPartyNumber", 
                "origIpv4v6Addr", "destIpv4v6Addr", "origVideoCap_Codec_Channel2", 
                "origVideoCap_Bandwidth_Channel2", "origVideoCap_Resolution_Channel2", 
                "origVideoTransportAddress_IP_Channel2", "origVideoTransportAddress_Port_Channel2", 
                "origVideoChannel_Role_Channel2", "destVideoCap_Codec_Channel2", 
                "destVideoCap_Bandwidth_Channel2", "destVideoCap_Resolution_Channel2", 
                "destVideoTransportAddress_IP_Channel2", "destVideoTransportAddress_Port_Channel2", 
                "destVideoChannel_Role_Channel2", "incomingProtocolID", "incomingProtocolCallRef", 
                "outgoingProtocolID", "outgoingProtocolCallRef", "currentRoutingReason", "origRoutingReason", 
                "lastRedirectingRoutingReason", "huntPilotDN", "huntPilotPartition", "calledPartyPatternUsage", 
                "outpulsedOriginalCalledPartyNumber", "outpulsedLastRedirectingNumber", "wasCallQueued", 
                "totalWaitTimeInQueue", "callingPartyNumber_uri", "originalCalledPartyNumber_uri", 
                "finalCalledPartyNumber_uri", "lastRedirectDn_uri", "mobileCallingPartyNumber", 
                "finalMobileCalledPartyNumber", "origMobileDeviceName", "destMobileDeviceName", 
                "origMobileCallDuration", "destMobileCallDuration", "mobileCallType", 
                "originalCalledPartyPattern", "finalCalledPartyPattern", "lastRedirectingPartyPattern", 
                "huntPilotPattern", "raw_data", "created_at", "updated_at"
              ) VALUES (
                ${safeParseInt(row.cdrRecordType) !== null ? safeParseInt(row.cdrRecordType) : 'NULL'}, 
                ${safeParseInt(row.globalCallID_callManagerId) !== null ? safeParseInt(row.globalCallID_callManagerId) : 'NULL'}, 
                ${escapeSqlString(cleanString(row.globalCallID_callId))}, 
                ${escapeSqlString(cleanString(row.origLegCallIdentifier))}, 
                ${safeParseInt(row.dateTimeOrigination, Date.now())}, 
                ${safeParseInt(row.origNodeId)}, 
                ${safeParseInt(row.origSpan)}, 
                ${escapeSqlString(cleanString(row.origIpAddr))}, 
                ${escapeSqlString(cleanString(row.callingPartyNumber))}, 
                ${escapeSqlString(cleanString(row.callingPartyUnicodeLoginUserID))}, 
                ${escapeSqlString(cleanString(row.origCause_location))}, 
                ${safeParseInt(row.origCause_value)}, 
                ${escapeSqlString(cleanString(row.origPrecedenceLevel))}, 
                ${escapeSqlString(cleanString(row.origMediaTransportAddress_IP))}, 
                ${safeParseInt(row.origMediaTransportAddress_Port)}, 
                ${safeParseInt(row.origMediaCap_payloadCapability)}, 
                ${safeParseInt(row.origMediaCap_maxFramesPerPacket)}, 
                ${safeParseInt(row.origMediaCap_g723BitRate)}, 
                ${escapeSqlString(cleanString(row.origVideoCap_Codec))}, 
                ${safeParseInt(row.origVideoCap_Bandwidth)}, 
                ${escapeSqlString(cleanString(row.origVideoCap_Resolution))}, 
                ${escapeSqlString(cleanString(row.origVideoTransportAddress_IP))}, 
                ${safeParseInt(row.origVideoTransportAddress_Port)}, 
                ${safeParseInt(row.origRSVPAudioStat)}, 
                ${safeParseInt(row.origRSVPVideoStat)}, 
                ${escapeSqlString(cleanString(row.destLegIdentifier))}, 
                ${safeParseInt(row.destNodeId)}, 
                ${safeParseInt(row.destSpan)}, 
                ${escapeSqlString(cleanString(row.destIpAddr))}, 
                ${escapeSqlString(cleanString(row.originalCalledPartyNumber))}, 
                ${escapeSqlString(cleanString(row.finalCalledPartyNumber))}, 
                ${escapeSqlString(cleanString(row.finalCalledPartyUnicodeLoginUserID))}, 
                ${escapeSqlString(cleanString(row.destCause_location))}, 
                ${safeParseInt(row.destCause_value)}, 
                ${escapeSqlString(cleanString(row.destPrecedenceLevel))}, 
                ${escapeSqlString(cleanString(row.destMediaTransportAddress_IP))}, 
                ${safeParseInt(row.destMediaTransportAddress_Port)}, 
                ${safeParseInt(row.destMediaCap_payloadCapability)}, 
                ${safeParseInt(row.destMediaCap_maxFramesPerPacket)}, 
                ${safeParseInt(row.destMediaCap_g723BitRate)}, 
                ${escapeSqlString(cleanString(row.destVideoCap_Codec))}, 
                ${safeParseInt(row.destVideoCap_Bandwidth)}, 
                ${escapeSqlString(cleanString(row.destVideoCap_Resolution))}, 
                ${escapeSqlString(cleanString(row.destVideoTransportAddress_IP))}, 
                ${safeParseInt(row.destVideoTransportAddress_Port)}, 
                ${safeParseInt(row.destRSVPAudioStat)}, 
                ${safeParseInt(row.destRSVPVideoStat)}, 
                ${safeParseInt(row.dateTimeConnect)}, 
                ${safeParseInt(row.dateTimeDisconnect)}, 
                ${escapeSqlString(cleanString(row.lastRedirectDn))}, 
                ${escapeSqlString(cleanString(row.pkid))}, 
                ${escapeSqlString(cleanString(row.originalCalledPartyNumberPartition))}, 
                ${escapeSqlString(cleanString(row.callingPartyNumberPartition))}, 
                ${escapeSqlString(cleanString(row.finalCalledPartyNumberPartition))}, 
                ${escapeSqlString(cleanString(row.lastRedirectDnPartition))}, 
                ${safeParseInt(row.duration, 0)}, 
                ${escapeSqlString(cleanString(row.origDeviceName))}, 
                ${escapeSqlString(cleanString(row.destDeviceName))}, 
                ${safeParseInt(row.origCallTerminationOnBehalfOf)}, 
                ${safeParseInt(row.destCallTerminationOnBehalfOf)}, 
                ${safeParseInt(row.origCalledPartyRedirectOnBehalfOf)}, 
                ${safeParseInt(row.lastRedirectRedirectOnBehalfOf)}, 
                ${escapeSqlString(cleanString(row.origCalledPartyRedirectReason))}, 
                ${escapeSqlString(cleanString(row.lastRedirectRedirectReason))}, 
                ${escapeSqlString(cleanString(row.destConversationId))}, 
                ${escapeSqlString(cleanString(row.globalCallId_ClusterID))}, 
                ${safeParseInt(row.joinOnBehalfOf)}, 
                ${escapeSqlString(cleanString(row.comment))}, 
                ${escapeSqlString(cleanString(row.authCodeDescription))}, 
                ${safeParseInt(row.authorizationLevel)}, 
                ${escapeSqlString(cleanString(row.clientMatterCode))}, 
                ${escapeSqlString(cleanString(row.origDTMFMethod))}, 
                ${escapeSqlString(cleanString(row.destDTMFMethod))}, 
                ${escapeSqlString(cleanString(row.callSecuredStatus))}, 
                ${escapeSqlString(cleanString(row.origConversationId))}, 
                ${safeParseInt(row.origMediaCap_Bandwidth)}, 
                ${safeParseInt(row.destMediaCap_Bandwidth)}, 
                ${escapeSqlString(cleanString(row.authorizationCodeValue))}, 
                ${escapeSqlString(cleanString(row.outpulsedCallingPartyNumber))}, 
                ${escapeSqlString(cleanString(row.outpulsedCalledPartyNumber))}, 
                ${escapeSqlString(cleanString(row.origIpv4v6Addr))}, 
                ${escapeSqlString(cleanString(row.destIpv4v6Addr))}, 
                ${escapeSqlString(cleanString(row.origVideoCap_Codec_Channel2))}, 
                ${safeParseInt(row.origVideoCap_Bandwidth_Channel2)}, 
                ${escapeSqlString(cleanString(row.origVideoCap_Resolution_Channel2))}, 
                ${escapeSqlString(cleanString(row.origVideoTransportAddress_IP_Channel2))}, 
                ${safeParseInt(row.origVideoTransportAddress_Port_Channel2)}, 
                ${escapeSqlString(cleanString(row.origVideoChannel_Role_Channel2))}, 
                ${escapeSqlString(cleanString(row.destVideoCap_Codec_Channel2))}, 
                ${safeParseInt(row.destVideoCap_Bandwidth_Channel2)}, 
                ${escapeSqlString(cleanString(row.destVideoCap_Resolution_Channel2))}, 
                ${escapeSqlString(cleanString(row.destVideoTransportAddress_IP_Channel2))}, 
                ${safeParseInt(row.destVideoTransportAddress_Port_Channel2)}, 
                ${escapeSqlString(cleanString(row.destVideoChannel_Role_Channel2))}, 
                ${escapeSqlString(cleanString(row.incomingProtocolID))}, 
                ${escapeSqlString(cleanString(row.incomingProtocolCallRef))}, 
                ${escapeSqlString(cleanString(row.outgoingProtocolID))}, 
                ${escapeSqlString(cleanString(row.outgoingProtocolCallRef))}, 
                ${escapeSqlString(cleanString(row.currentRoutingReason))}, 
                ${escapeSqlString(cleanString(row.origRoutingReason))}, 
                ${escapeSqlString(cleanString(row.lastRedirectingRoutingReason))}, 
                ${escapeSqlString(cleanString(row.huntPilotDN))}, 
                ${escapeSqlString(cleanString(row.huntPilotPartition))}, 
                ${escapeSqlString(cleanString(row.calledPartyPatternUsage))}, 
                ${escapeSqlString(cleanString(row.outpulsedOriginalCalledPartyNumber))}, 
                ${escapeSqlString(cleanString(row.outpulsedLastRedirectingNumber))}, 
                ${row.wasCallQueued === 'true' ? `'true'` : (row.wasCallQueued === 'false' ? `'false'` : 'NULL')}, 
                ${safeParseInt(row.totalWaitTimeInQueue)}, 
                ${escapeSqlString(cleanString(row.callingPartyNumber_uri))}, 
                ${escapeSqlString(cleanString(row.originalCalledPartyNumber_uri))}, 
                ${escapeSqlString(cleanString(row.finalCalledPartyNumber_uri))}, 
                ${escapeSqlString(cleanString(row.lastRedirectDn_uri))}, 
                ${escapeSqlString(cleanString(row.mobileCallingPartyNumber))}, 
                ${escapeSqlString(cleanString(row.finalMobileCalledPartyNumber))}, 
                ${escapeSqlString(cleanString(row.origMobileDeviceName))}, 
                ${escapeSqlString(cleanString(row.destMobileDeviceName))}, 
                ${safeParseInt(row.origMobileCallDuration)}, 
                ${safeParseInt(row.destMobileCallDuration)}, 
                ${escapeSqlString(cleanString(row.mobileCallType))}, 
                ${escapeSqlString(cleanString(row.originalCalledPartyPattern))}, 
                ${escapeSqlString(cleanString(row.finalCalledPartyPattern))}, 
                ${escapeSqlString(cleanString(row.lastRedirectingPartyPattern))}, 
                ${escapeSqlString(cleanString(row.huntPilotPattern))}, 
                '${JSON.stringify(row).replace(/'/g, "''")}', NOW(), NOW()
              ) 
              RETURNING id;
            `;
            
            const results = await db.sequelize.query(cdrRawSQL, {
              type: db.sequelize.QueryTypes.INSERT,
              transaction
            });
            
            // Di Postgres, hasil query INSERT RETURNING biasanya ada di results[0][0].id
            const cdrRawId = results[0][0].id;
            
            if (!cdrRawId) {
              throw new Error('Failed to retrieve inserted CDR Raw ID');
            }
            
            // Step 1-4 using BillingService
            const billingData = await BillingService.processRecord(cdrRawId, row);
            
            // Insert into calls_processed
            await db.callsprocessed.create(billingData, { transaction });
            
            processedRows++;
          } catch (rowError) {
            errorRows++;
            const errorMessage = rowError.original?.message || rowError.message || 'Unknown error';
            logger.error(`Error processing row ${processedRows + errorRows} (${cleanString(row.globalCallID_callId, 'N/A')}): ${errorMessage}`);
            // Also log the actual row data if it's a parsing error
            if (!row.globalCallID_callId) {
              logger.info('Row data sample for debug', row);
            }
          }
        }

        // Commit transaction after all rows are processed
        await transaction.commit();
        
        logger.success(`File processed successfully: ${fileName}`);
        logger.info(`Processing summary`, {
          fileName,
          totalRows: processedRows + errorRows,
          successRows: processedRows,
          errorRows,
          processingTime: new Date().toISOString()
        });
        
        const successPath = path.join(CONFIG.successFolder, `${Date.now()}_${fileName}`);
        await fs.move(filePath, successPath);
        logger.success(`File moved to success folder: ${successPath}`);
        
        return { success: true, processedRows, errorRows };

      } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
      }
    };

    return processStream();
    
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        logger.error('Failed to rollback transaction', rollbackError);
      }
    }
    
    logger.error(`Failed to process file: ${fileName}`, error);
    
    try {
      const failedPath = path.join(CONFIG.failedFolder, `${Date.now()}_${fileName}`);
      await fs.move(filePath, failedPath);
      logger.info(`File moved to failed folder: ${failedPath}`);
    } catch (moveError) {
      logger.error('Failed to move file to failed folder', moveError);
    }
    
    throw error;
  }
}

// Process all existing files in incoming folder
async function processExistingFiles() {
  try {
    const files = await fs.readdir(CONFIG.incomingFolder);
    const csvFiles = files.filter(file => 
      CONFIG.supportedExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
    
    logger.info(`Found ${csvFiles.length} existing files to process`);
    
    for (const file of csvFiles) {
      const filePath = path.join(CONFIG.incomingFolder, file);
      try {
        await processFile(filePath);
      } catch (error) {
        logger.error(`Failed to process existing file: ${file}`, error);
      }
    }
    
  } catch (error) {
    logger.error('Failed to process existing files', error);
  }
}

// Setup file watcher
function setupWatcher() {
  const watcher = chokidar.watch(CONFIG.incomingFolder, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });
  
  watcher
    .on('add', async (filePath) => {
      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName).toLowerCase();
      
      if (CONFIG.supportedExtensions.includes(fileExt)) {
        logger.watcher(`New file detected: ${fileName}`);
        
        setTimeout(async () => {
          try {
            await processFile(filePath);
          } catch (error) {
            logger.error(`Failed to process new file: ${fileName}`, error);
          }
        }, CONFIG.batchDelay);
      }
    })
    .on('error', (error) => {
      logger.error('Watcher error', error);
    });
  
  logger.watcher(`File watcher started for folder: ${CONFIG.incomingFolder}`);
  return watcher;
}

// Graceful shutdown
function setupGracefulShutdown(watcher) {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    
    if (watcher) {
      await watcher.close();
      logger.info('File watcher closed');
    }
    
    await db.sequelize.close();
    logger.info('Database connection closed');
    
    process.exit(0);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Main function
async function main() {
  try {
    logger.info('Starting CDR Importer Service');
    
    await ensureDirectories();
    
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    await processExistingFiles();
    
    const watcher = setupWatcher();
    
    setupGracefulShutdown(watcher);
    
    logger.info('CDR Importer Service is running. Press Ctrl+C to stop.');
    
  } catch (error) {
    logger.error('Failed to start CDR Importer Service', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start of service
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  ensureDirectories,
  normalizeTimestamp,
  determineCallType
};
