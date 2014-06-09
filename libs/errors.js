module.exports = (function() {
  return {
    system_encoding_error: {status: '000', data: 'Encoding error'},
    system_key_error: {status: '001', data: 'Key not found'},
    system_version_error: {status: '002', data: 'Application version error'},
    user_login_error: {status: '101', data: 'Login error'},
    user_signup_error: {status: '102', data: 'Error signing up, email exists'},
    user_avatar_upload_error: {status: '103', data: 'Error changing avatar, upload failed'},
    user_change_password_error: {status: '104', data: 'Error changing password, password incorrect'},
    profiles_list_not_found_error: {status: '201', data: 'Error fetching profiles list'},
    profiles_profile_not_found_error: {status: '202', data: 'Requested profile not found'},
    friends_list_fetch_error: {status: '301', data: 'Error fetching friends list'},
    friends_request_send_error: {status: '302', data: 'Error sending friend request, probably request already sent'},
    friends_response_send_error: {status: '303', data: 'Error sending friend request response, probably response already sent'},
    chat_recipient_not_found: {status: '401', data: 'Reipient not found, wrong recipient ID'},
    chat_sender_not_found: {status: '402', data: 'Sender not found, wrong sender ID'}
    
  }
})();