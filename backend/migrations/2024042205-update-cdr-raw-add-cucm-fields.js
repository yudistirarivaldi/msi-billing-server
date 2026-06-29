'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add all CUCM fields to cdr_raw table
    const fieldsToAdd = [
      // Basic call info
      { name: 'cdrRecordType', type: Sequelize.INTEGER },
      { name: 'globalCallID_callManagerId', type: Sequelize.INTEGER },
      { name: 'origLegCallIdentifier', type: Sequelize.STRING(100) },
      
      // Node and network info
      { name: 'origNodeId', type: Sequelize.INTEGER },
      { name: 'origSpan', type: Sequelize.INTEGER },
      { name: 'origIpAddr', type: Sequelize.STRING(45) },
      { name: 'destLegIdentifier', type: Sequelize.STRING(100) },
      { name: 'destNodeId', type: Sequelize.INTEGER },
      { name: 'destSpan', type: Sequelize.INTEGER },
      { name: 'destIpAddr', type: Sequelize.STRING(45) },
      
      // User info
      { name: 'callingPartyUnicodeLoginUserID', type: Sequelize.STRING(255) },
      { name: 'finalCalledPartyUnicodeLoginUserID', type: Sequelize.STRING(255) },
      
      // Cause and precedence
      { name: 'origCause_location', type: Sequelize.STRING(50) },
      { name: 'origPrecedenceLevel', type: Sequelize.STRING(50) },
      { name: 'destCause_location', type: Sequelize.STRING(50) },
      { name: 'destPrecedenceLevel', type: Sequelize.STRING(50) },
      
      // Media transport
      { name: 'origMediaTransportAddress_IP', type: Sequelize.STRING(45) },
      { name: 'origMediaTransportAddress_Port', type: Sequelize.INTEGER },
      { name: 'destMediaTransportAddress_IP', type: Sequelize.STRING(45) },
      { name: 'destMediaTransportAddress_Port', type: Sequelize.INTEGER },
      
      // Media capabilities
      { name: 'origMediaCap_payloadCapability', type: Sequelize.INTEGER },
      { name: 'origMediaCap_maxFramesPerPacket', type: Sequelize.INTEGER },
      { name: 'origMediaCap_g723BitRate', type: Sequelize.INTEGER },
      { name: 'destMediaCap_payloadCapability', type: Sequelize.INTEGER },
      { name: 'destMediaCap_maxFramesPerPacket', type: Sequelize.INTEGER },
      { name: 'destMediaCap_g723BitRate', type: Sequelize.INTEGER },
      
      // Video capabilities
      { name: 'origVideoCap_Codec', type: Sequelize.STRING(50) },
      { name: 'origVideoCap_Bandwidth', type: Sequelize.INTEGER },
      { name: 'origVideoCap_Resolution', type: Sequelize.STRING(50) },
      { name: 'origVideoTransportAddress_IP', type: Sequelize.STRING(45) },
      { name: 'origVideoTransportAddress_Port', type: Sequelize.INTEGER },
      { name: 'destVideoCap_Codec', type: Sequelize.STRING(50) },
      { name: 'destVideoCap_Bandwidth', type: Sequelize.INTEGER },
      { name: 'destVideoCap_Resolution', type: Sequelize.STRING(50) },
      { name: 'destVideoTransportAddress_IP', type: Sequelize.STRING(45) },
      { name: 'destVideoTransportAddress_Port', type: Sequelize.INTEGER },
      
      // RSVP
      { name: 'origRSVPAudioStat', type: Sequelize.INTEGER },
      { name: 'origRSVPVideoStat', type: Sequelize.INTEGER },
      { name: 'destRSVPAudioStat', type: Sequelize.INTEGER },
      { name: 'destRSVPVideoStat', type: Sequelize.INTEGER },
      
      // Call details
      { name: 'originalCalledPartyNumber', type: Sequelize.STRING(50) },
      { name: 'dateTimeConnect', type: Sequelize.BIGINT },
      { name: 'dateTimeDisconnect', type: Sequelize.BIGINT },
      { name: 'pkid', type: Sequelize.STRING(255) },
      { name: 'duration', type: Sequelize.INTEGER },
      { name: 'destDeviceName', type: Sequelize.STRING(255) },
      
      // Partitions
      { name: 'originalCalledPartyNumberPartition', type: Sequelize.STRING(100) },
      { name: 'callingPartyNumberPartition', type: Sequelize.STRING(100) },
      { name: 'finalCalledPartyNumberPartition', type: Sequelize.STRING(100) },
      { name: 'lastRedirectDnPartition', type: Sequelize.STRING(100) },
      
      // Termination and redirect
      { name: 'origCallTerminationOnBehalfOf', type: Sequelize.STRING(100) },
      { name: 'destCallTerminationOnBehalfOf', type: Sequelize.STRING(100) },
      { name: 'origCalledPartyRedirectOnBehalfOf', type: Sequelize.STRING(100) },
      { name: 'lastRedirectRedirectOnBehalfOf', type: Sequelize.STRING(100) },
      { name: 'origCalledPartyRedirectReason', type: Sequelize.STRING(100) },
      { name: 'lastRedirectRedirectReason', type: Sequelize.STRING(100) },
      
      // Conversation and cluster
      { name: 'destConversationId', type: Sequelize.STRING(100) },
      { name: 'globalCallId_ClusterID', type: Sequelize.STRING(100) },
      { name: 'joinOnBehalfOf', type: Sequelize.STRING(100) },
      { name: 'comment', type: Sequelize.TEXT },
      { name: 'authorizationLevel', type: Sequelize.INTEGER },
      { name: 'origDTMFMethod', type: Sequelize.STRING(50) },
      { name: 'destDTMFMethod', type: Sequelize.STRING(50) },
      { name: 'callSecuredStatus', type: Sequelize.STRING(50) },
      { name: 'origConversationId', type: Sequelize.STRING(100) },
      
      // Media bandwidth
      { name: 'origMediaCap_Bandwidth', type: Sequelize.INTEGER },
      { name: 'destMediaCap_Bandwidth', type: Sequelize.INTEGER },
      { name: 'authorizationCodeValue', type: Sequelize.STRING(100) },
      { name: 'outpulsedCallingPartyNumber', type: Sequelize.STRING(50) },
      { name: 'outpulsedCalledPartyNumber', type: Sequelize.STRING(50) },
      
      // IPv6
      { name: 'origIpv4v6Addr', type: Sequelize.STRING(45) },
      { name: 'destIpv4v6Addr', type: Sequelize.STRING(45) },
      
      // Video channel 2
      { name: 'origVideoCap_Codec_Channel2', type: Sequelize.STRING(50) },
      { name: 'origVideoCap_Bandwidth_Channel2', type: Sequelize.INTEGER },
      { name: 'origVideoCap_Resolution_Channel2', type: Sequelize.STRING(50) },
      { name: 'origVideoTransportAddress_IP_Channel2', type: Sequelize.STRING(45) },
      { name: 'origVideoTransportAddress_Port_Channel2', type: Sequelize.INTEGER },
      { name: 'origVideoChannel_Role_Channel2', type: Sequelize.STRING(50) },
      { name: 'destVideoCap_Codec_Channel2', type: Sequelize.STRING(50) },
      { name: 'destVideoCap_Bandwidth_Channel2', type: Sequelize.INTEGER },
      { name: 'destVideoCap_Resolution_Channel2', type: Sequelize.STRING(50) },
      { name: 'destVideoTransportAddress_IP_Channel2', type: Sequelize.STRING(45) },
      { name: 'destVideoTransportAddress_Port_Channel2', type: Sequelize.INTEGER },
      { name: 'destVideoChannel_Role_Channel2', type: Sequelize.STRING(50) },
      
      // Protocol
      { name: 'incomingProtocolID', type: Sequelize.STRING(50) },
      { name: 'incomingProtocolCallRef', type: Sequelize.STRING(100) },
      { name: 'outgoingProtocolID', type: Sequelize.STRING(50) },
      { name: 'outgoingProtocolCallRef', type: Sequelize.STRING(100) },
      
      // Routing
      { name: 'currentRoutingReason', type: Sequelize.STRING(100) },
      { name: 'origRoutingReason', type: Sequelize.STRING(100) },
      { name: 'lastRedirectingRoutingReason', type: Sequelize.STRING(100) },
      { name: 'huntPilotDN', type: Sequelize.STRING(50) },
      { name: 'huntPilotPartition', type: Sequelize.STRING(100) },
      { name: 'calledPartyPatternUsage', type: Sequelize.STRING(100) },
      { name: 'outpulsedOriginalCalledPartyNumber', type: Sequelize.STRING(50) },
      { name: 'outpulsedLastRedirectingNumber', type: Sequelize.STRING(50) },
      { name: 'wasCallQueued', type: Sequelize.BOOLEAN },
      { name: 'totalWaitTimeInQueue', type: Sequelize.INTEGER },
      
      // URI
      { name: 'callingPartyNumber_uri', type: Sequelize.STRING(255) },
      { name: 'originalCalledPartyNumber_uri', type: Sequelize.STRING(255) },
      { name: 'finalCalledPartyNumber_uri', type: Sequelize.STRING(255) },
      { name: 'lastRedirectDn_uri', type: Sequelize.STRING(255) },
      
      // Mobile
      { name: 'mobileCallingPartyNumber', type: Sequelize.STRING(50) },
      { name: 'finalMobileCalledPartyNumber', type: Sequelize.STRING(50) },
      { name: 'origMobileDeviceName', type: Sequelize.STRING(255) },
      { name: 'destMobileDeviceName', type: Sequelize.STRING(255) },
      { name: 'origMobileCallDuration', type: Sequelize.INTEGER },
      { name: 'destMobileCallDuration', type: Sequelize.INTEGER },
      { name: 'mobileCallType', type: Sequelize.STRING(50) },
      
      // Patterns
      { name: 'originalCalledPartyPattern', type: Sequelize.STRING(100) },
      { name: 'finalCalledPartyPattern', type: Sequelize.STRING(100) },
      { name: 'lastRedirectingPartyPattern', type: Sequelize.STRING(100) },
      { name: 'huntPilotPattern', type: Sequelize.STRING(100) }
    ];

    // Add all fields
    for (const field of fieldsToAdd) {
      await queryInterface.addColumn('cdr_raw', field.name, {
        type: field.type,
        allowNull: true
      });
    }

    // Add JSONB column for storing raw data
    await queryInterface.addColumn('cdr_raw', 'raw_data', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Complete raw CDR data as JSON'
    });

    // Add additional indexes for performance (skip existing ones)
    const indexesToAdd = [
      ['dateTimeConnect'],
      ['dateTimeDisconnect'],
      ['destDeviceName'],
      ['originalCalledPartyNumber'],
      ['callingPartyNumberPartition'],
      ['finalCalledPartyNumberPartition'],
      ['duration'],
      ['pkid']
    ];

    for (const index of indexesToAdd) {
      try {
        await queryInterface.addIndex('cdr_raw', index);
      } catch (error) {
        // Ignore index already exists error
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all added columns
    const fieldsToRemove = [
      'cdrRecordType', 'globalCallID_callManagerId', 'origLegCallIdentifier',
      'origNodeId', 'origSpan', 'origIpAddr', 'destLegIdentifier', 'destNodeId', 'destSpan', 'destIpAddr',
      'callingPartyUnicodeLoginUserID', 'finalCalledPartyUnicodeLoginUserID',
      'origCause_location', 'origPrecedenceLevel', 'destCause_location', 'destPrecedenceLevel',
      'origMediaTransportAddress_IP', 'origMediaTransportAddress_Port', 'destMediaTransportAddress_IP', 'destMediaTransportAddress_Port',
      'origMediaCap_payloadCapability', 'origMediaCap_maxFramesPerPacket', 'origMediaCap_g723BitRate',
      'destMediaCap_payloadCapability', 'destMediaCap_maxFramesPerPacket', 'destMediaCap_g723BitRate',
      'origVideoCap_Codec', 'origVideoCap_Bandwidth', 'origVideoCap_Resolution', 'origVideoTransportAddress_IP', 'origVideoTransportAddress_Port',
      'destVideoCap_Codec', 'destVideoCap_Bandwidth', 'destVideoCap_Resolution', 'destVideoTransportAddress_IP', 'destVideoTransportAddress_Port',
      'origRSVPAudioStat', 'origRSVPVideoStat', 'destRSVPAudioStat', 'destRSVPVideoStat',
      'originalCalledPartyNumber', 'dateTimeConnect', 'dateTimeDisconnect', 'pkid', 'duration', 'destDeviceName',
      'originalCalledPartyNumberPartition', 'callingPartyNumberPartition', 'finalCalledPartyNumberPartition', 'lastRedirectDnPartition',
      'origCallTerminationOnBehalfOf', 'destCallTerminationOnBehalfOf', 'origCalledPartyRedirectOnBehalfOf', 'lastRedirectRedirectOnBehalfOf',
      'origCalledPartyRedirectReason', 'lastRedirectRedirectReason', 'destConversationId', 'globalCallId_ClusterID', 'joinOnBehalfOf',
      'comment', 'authorizationLevel', 'origDTMFMethod', 'destDTMFMethod', 'callSecuredStatus', 'origConversationId',
      'origMediaCap_Bandwidth', 'destMediaCap_Bandwidth', 'authorizationCodeValue', 'outpulsedCallingPartyNumber', 'outpulsedCalledPartyNumber',
      'origIpv4v6Addr', 'destIpv4v6Addr',
      'origVideoCap_Codec_Channel2', 'origVideoCap_Bandwidth_Channel2', 'origVideoCap_Resolution_Channel2', 'origVideoTransportAddress_IP_Channel2', 'origVideoTransportAddress_Port_Channel2', 'origVideoChannel_Role_Channel2',
      'destVideoCap_Codec_Channel2', 'destVideoCap_Bandwidth_Channel2', 'destVideoCap_Resolution_Channel2', 'destVideoTransportAddress_IP_Channel2', 'destVideoTransportAddress_Port_Channel2', 'destVideoChannel_Role_Channel2',
      'incomingProtocolID', 'incomingProtocolCallRef', 'outgoingProtocolID', 'outgoingProtocolCallRef',
      'currentRoutingReason', 'origRoutingReason', 'lastRedirectingRoutingReason', 'huntPilotDN', 'huntPilotPartition', 'calledPartyPatternUsage',
      'outpulsedOriginalCalledPartyNumber', 'outpulsedLastRedirectingNumber', 'wasCallQueued', 'totalWaitTimeInQueue',
      'callingPartyNumber_uri', 'originalCalledPartyNumber_uri', 'finalCalledPartyNumber_uri', 'lastRedirectDn_uri',
      'mobileCallingPartyNumber', 'finalMobileCalledPartyNumber', 'origMobileDeviceName', 'destMobileDeviceName',
      'origMobileCallDuration', 'destMobileCallDuration', 'mobileCallType',
      'originalCalledPartyPattern', 'finalCalledPartyPattern', 'lastRedirectingPartyPattern', 'huntPilotPattern',
      'raw_data'
    ];

    for (const field of fieldsToRemove) {
      await queryInterface.removeColumn('cdr_raw', field);
    }
  }
};
