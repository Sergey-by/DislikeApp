var CryptoJS = require("crypto-js");

module.exports = (function() {
  return {
    _enabled: false,
    _serverAESPass: "server_password!",
    
    encodeAES: function(password, data) {
	if(this._enabled) {
		try {
		      var encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(password), { mode: CryptoJS.mode.ECB });
		      return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
		} catch(e) {
		    return null;
		}
	} else {
		return data;
	}
    }, 
    decodeAES: function(password, data) {
	if(this._enabled) {
		try {
			var cipherParams = CryptoJS.lib.CipherParams.create({
				ciphertext: CryptoJS.enc.Base64.parse(data)
			});
			var decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Utf8.parse(password), { mode: CryptoJS.mode.ECB });
			return decrypted.toString(CryptoJS.enc.Utf8);
		} catch(e) {
		    return null;
		}
	} else {
		return data;
	}
      
    },
    decodeRSA: function(data) {
	//TODO: Implement RSA Decode
	return this.decodeAES(this._serverAESPass, data);
    }
  }
})();