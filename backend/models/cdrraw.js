'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CdrRaw extends Model {
    static associate(models) {
      // Association to calls_processed
      CdrRaw.hasOne(models.callsprocessed, {
        foreignKey: 'call_id',
        as: 'processed_call'
      });
    }
  }

  CdrRaw.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    globalCallId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 100]
      }
    },
    dateTimeOrigination: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'dateTimeOrigination',
      comment: 'Raw timestamp from CUCM'
    },
    callingPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    finalCalledPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    origDeviceName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastRedirectDn: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    clientMatterCode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    authCodeDescription: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    origCause_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'origCause_value',
      validate: {
        min: 0
      }
    },
    destCause_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'destCause_value',
      validate: {
        min: 0
      }
    },
    
    // CUCM Complete Fields
    cdrRecordType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    globalCallID_callManagerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origLegCallIdentifier: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    origNodeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origSpan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origIpAddr: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    destLegIdentifier: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    destNodeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destSpan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destIpAddr: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    callingPartyUnicodeLoginUserID: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    finalCalledPartyUnicodeLoginUserID: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    origCause_location: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'origCause_location'
    },
    origPrecedenceLevel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    destCause_location: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'destCause_location'
    },
    destPrecedenceLevel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origMediaTransportAddress_IP: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    origMediaTransportAddress_Port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destMediaTransportAddress_IP: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    destMediaTransportAddress_Port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origMediaCap_payloadCapability: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origMediaCap_maxFramesPerPacket: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origMediaCap_g723BitRate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destMediaCap_payloadCapability: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destMediaCap_maxFramesPerPacket: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destMediaCap_g723BitRate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origVideoCap_Codec: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origVideoCap_Bandwidth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origVideoCap_Resolution: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origVideoTransportAddress_IP: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    origVideoTransportAddress_Port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destVideoCap_Codec: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    destVideoCap_Bandwidth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destVideoCap_Resolution: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    destVideoTransportAddress_IP: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    destVideoTransportAddress_Port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origRSVPAudioStat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origRSVPVideoStat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destRSVPAudioStat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destRSVPVideoStat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    originalCalledPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    dateTimeConnect: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'dateTimeConnect'
    },
    dateTimeDisconnect: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'dateTimeDisconnect'
    },
    pkid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destDeviceName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    originalCalledPartyNumberPartition: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    callingPartyNumberPartition: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    finalCalledPartyNumberPartition: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastRedirectDnPartition: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    origCallTerminationOnBehalfOf: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    destCallTerminationOnBehalfOf: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    origCalledPartyRedirectOnBehalfOf: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastRedirectRedirectOnBehalfOf: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    origCalledPartyRedirectReason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastRedirectRedirectReason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    destConversationId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    globalCallId_ClusterID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    joinOnBehalfOf: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    authorizationLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origDTMFMethod: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    destDTMFMethod: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    callSecuredStatus: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origConversationId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    origMediaCap_Bandwidth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destMediaCap_Bandwidth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    authorizationCodeValue: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    outpulsedCallingPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    outpulsedCalledPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origIpv4v6Addr: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    destIpv4v6Addr: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    origVideoCap_Codec_Channel2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origVideoCap_Bandwidth_Channel2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origVideoCap_Resolution_Channel2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origVideoTransportAddress_IP_Channel2: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    origVideoTransportAddress_Port_Channel2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origVideoChannel_Role_Channel2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    destVideoCap_Codec_Channel2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    destVideoCap_Bandwidth_Channel2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destVideoCap_Resolution_Channel2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    destVideoTransportAddress_IP_Channel2: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    destVideoTransportAddress_Port_Channel2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destVideoChannel_Role_Channel2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    incomingProtocolID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    incomingProtocolCallRef: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    outgoingProtocolID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    outgoingProtocolCallRef: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    currentRoutingReason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    origRoutingReason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastRedirectingRoutingReason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    huntPilotDN: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    huntPilotPartition: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    calledPartyPatternUsage: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    outpulsedOriginalCalledPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    outpulsedLastRedirectingNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    wasCallQueued: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    totalWaitTimeInQueue: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    callingPartyNumber_uri: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    originalCalledPartyNumber_uri: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    finalCalledPartyNumber_uri: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastRedirectDn_uri: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mobileCallingPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    finalMobileCalledPartyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    origMobileDeviceName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    destMobileDeviceName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    origMobileCallDuration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destMobileCallDuration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mobileCallType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    originalCalledPartyPattern: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    finalCalledPartyPattern: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastRedirectingPartyPattern: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    huntPilotPattern: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    raw_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Complete raw CDR data as JSON'
    }
  }, {
    sequelize,
    modelName: 'cdrraw',
    tableName: 'cdr_raw',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['globalCallId']
      },
      {
        fields: ['dateTimeOrigination']
      },
      {
        fields: ['callingPartyNumber']
      },
      {
        fields: ['finalCalledPartyNumber']
      },
      {
        fields: ['origDeviceName']
      },
      {
        fields: ['dateTimeConnect']
      },
      {
        fields: ['dateTimeDisconnect']
      },
      {
        fields: ['destDeviceName']
      },
      {
        fields: ['originalCalledPartyNumber']
      },
      {
        fields: ['callingPartyNumberPartition']
      },
      {
        fields: ['finalCalledPartyNumberPartition']
      },
      {
        fields: ['duration']
      },
      {
        fields: ['pkid']
      }
    ]
  });

  return CdrRaw;
};
