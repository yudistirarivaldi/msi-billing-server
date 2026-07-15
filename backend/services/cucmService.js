const axios = require('axios');
const https = require('https');

class CucmService {
  constructor() {
    this.cucmUrl = process.env.CUCM_URL || 'https://198.28.533.2:8443/axl/';
    this.cucmUser = process.env.CUCM_USER || 'admin';
    this.cucmPassword = process.env.CUCM_PASSWORD || '123456';
    this.restrictedCss = process.env.CUCM_RESTRICTED_CSS || 'Call_Everyone';
    this.unrestrictedCss = process.env.CUCM_UNRESTRICTED_CSS || 'PSTN_Incoming';

    // Disable SSL verification for self-signed certificates common in CUCM
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }

  /**
   * Applies CSS restriction to a specific device in CUCM
   * @param {string} deviceName The MAC/Name of the device (e.g. UCSFRBARROWS)
   * @returns {Promise<boolean>} True if successful
   */
  async restrictDevice(deviceName) {
    if (!deviceName) {
      console.warn('CUCM: Cannot restrict, missing deviceName.');
      return false;
    }

    const xmlBody = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/14.0">
   <soapenv:Header/>
   <soapenv:Body>
      <ns:updatePhone>
         <name>UCSFRBARROWS</name>
         <callingSearchSpaceName>${this.restrictedCss}</callingSearchSpaceName>
      </ns:updatePhone>
   </soapenv:Body>
</soapenv:Envelope>
    `.trim();

    try {
      console.log(`[CUCM] Sending updatePhone for device ${deviceName} with CSS ${this.restrictedCss}`);
      
      const authHeader = 'Basic ' + Buffer.from(`${this.cucmUser}:${this.cucmPassword}`).toString('base64');

      const response = await axios.post(this.cucmUrl, xmlBody, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'CUCM:DB ver=14.0 updatePhone',
          'Authorization': authHeader
        },
        httpsAgent: this.httpsAgent,
        timeout: 10000
      });

      // Basic validation of success response
      if (response.data && response.data.includes('updatePhoneResponse')) {
        console.log(`[CUCM] Successfully restricted device ${deviceName}`);
        return true;
      } else {
        console.warn(`[CUCM] Unexpected response format for ${deviceName}`, response.data);
        return false;
      }
    } catch (error) {
      console.error(`[CUCM] Failed to update phone ${deviceName}:`, error.message);
      if (error.response) {
        console.error(`[CUCM] Response status: ${error.response.status}`, error.response.data);
      }
      return false;
    }
  }

  /**
   * Removes CSS restriction from a specific device in CUCM
   * @param {string} deviceName The MAC/Name of the device
   * @returns {Promise<boolean>} True if successful
   */
  async unrestrictDevice(deviceName) {
    if (!deviceName) {
      console.warn('CUCM: Cannot unrestrict, missing deviceName.');
      return false;
    }

    const xmlBody = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/14.0">
   <soapenv:Header/>
   <soapenv:Body>
      <ns:updatePhone>
         <name>${deviceName}</name>
         <callingSearchSpaceName>${this.unrestrictedCss}</callingSearchSpaceName>
      </ns:updatePhone>
   </soapenv:Body>
</soapenv:Envelope>
    `.trim();

    try {
      console.log(`[CUCM] Sending updatePhone for device ${deviceName} with CSS ${this.unrestrictedCss} (UNRESTRICT)`);
      
      const authHeader = 'Basic ' + Buffer.from(`${this.cucmUser}:${this.cucmPassword}`).toString('base64');

      const response = await axios.post(this.cucmUrl, xmlBody, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'CUCM:DB ver=14.0 updatePhone',
          'Authorization': authHeader
        },
        httpsAgent: this.httpsAgent,
        timeout: 10000
      });

      if (response.data && response.data.includes('updatePhoneResponse')) {
        console.log(`[CUCM] Successfully unrestricted device ${deviceName}`);
        return true;
      } else {
        console.warn(`[CUCM] Unexpected response format for ${deviceName}`, response.data);
        return false;
      }
    } catch (error) {
      console.error(`[CUCM] Failed to update phone ${deviceName}:`, error.message);
      return false;
    }
  }
}

module.exports = new CucmService();
