module.exports = (function() {
    return {
	mysql: null,
	_init: function(MysqlConfig) {
	    this.mysql = require('mysql');
	    this.connectionpool = this.mysql.createPool(MysqlConfig);
	},

	connectionpool: null,
	queryWithParams : function(query, params, callback){
            this.connectionpool.getConnection(function(err, connection) {
                if (err) {
                    console.log(err);
                    callback({
                        statusCode: 500,
                        response: {
                            result: 'error',
                            err: err.code || 000,
                            errorText: "Error occured"
                        }
                    });
                } else { 
                    connection.query(query, params, function(err, rows, fields) {
                        if (err) {
                            console.log('2', err);
                            callback({
                                statusCode: 500,
                                response: {
                                    result: 'error',
                                    err: err.code || 000,
                                    errorText: "Error occured"
                                }
                            });
                        } else {
                            callback({
                                statusCode: 200,
                                response: {
                                    result: 'success',
                                    err: '',
                                    fields: fields,
                                    json: rows,
                                    length: rows.length
                                }
                            });
                        }
                        connection.release();
                    });
                }
            });
    	}, 
      
    	query : function(query, callback){
            this.connectionpool.getConnection(function(err, connection) {
                if (err) {
                    callback({
                        statusCode: 500,
                        response: {
                            result: 'error',
                            err: err.code || 000,
                            errorText: "Error occured"
                        }
                    });
                } else { 
                    connection.query(query, null, function(err, rows, fields) {
                        if (err) {
                            callback({
                                statusCode: 500,
                                response: {
                                    result: 'error',
                                    err: err.code || 000,
                                    errorText: "Error occured"
                                }
                            });
                        } else {
                            callback({
                                statusCode: 200,
                                response: {
                                    result: 'success',
                                    err: '',
                                    //fields: fields,
                                    json: rows,
                                    length: rows.length
                                }
                            });
                        }
                        connection.release();
                    });
                }
            });
    	}, 
    	
    	removeByIds: function(table, ids, callback){
    		 this.connectionpool.getConnection(function(err, connection) {
                 if (err) {
                     callback({
                         statusCode: 500,
                         response: {
                             result: 'error',
                             err: err.code || 000,
                             errorText: "Error occured"
                         }
                     });
                 } else {
                	 
                     var query = "DELETE FROM " + table + " WHERE id  IN ("+ ids + ")";
                     console.log(query);
                     connection.query(query, null, function(err, rows, fields) {
                         if (err) {
                             callback({
                                 statusCode: 500,
                                 response: {
                                     result: 'error',
                                     err: err.code || 000,
                                     errorText: "Error occured"
                                 }
                             });
                         } else {
                             callback({
                                 statusCode: 200,
                                 response: {
                                     result: 'success',
                                     err: '',
                                     //fields: fields,
                                     json: rows,
                                     length: rows.length
                                 }
                             });
                         }
                         connection.release();
                     });
                 }
             });
    	}, 
	
	remove: function(table, conditions, callback){
		 var _self = this;
    		 this.connectionpool.getConnection(function(err, connection) {
                 if (err) {
                     callback({
                         statusCode: 500,
                         response: {
                             result: 'error',
                             err: err.code || 000,
                             errorText: "Error occured"
                         }
                     });
                 } else {
		     
		    var whereString = '';
		    for (var n in conditions) {
                        whereString += n + ' = ' + _self.mysql.escape(conditions[n]) + ' AND ';
                    }
                    whereString += '1';
		   
                     var query = "DELETE FROM " + table + " WHERE " + whereString;
                     console.log(query);
                     connection.query(query, null, function(err, rows, fields) {
                         if (err) {
                             callback({
                                 statusCode: 500,
                                 response: {
                                     result: 'error',
                                     err: err.code || 000,
                                     errorText: "Error occured"
                                 }
                             });
                         } else {
                             callback({
                                 statusCode: 200,
                                 response: {
                                     result: 'success',
                                     err: '',
                                     //fields: fields,
                                     json: rows,
                                     length: rows.length
                                 }
                             });
                         }
                         connection.release();
                     });
                 }
             });
    	}, 
    	
    	insert: function(table, data, callback) {
            this.connectionpool.getConnection(function(err, connection) {
                if (err) {
                    callback({
                        statusCode: 500,
                        response: {
                            result: 'error',
                            err: err.code || 000,
                            errorText: "Error occured"
                        }
                    });
                } else {
                    var rowsString, valuesString;

                    for (var n in data) {
                        if (!rowsString) {
                            rowsString = n;
                            valuesString = ' \'' + data[n] + '\'';
                        } else {
                            rowsString += ', ' + n;
                            valuesString += ', \'' + data[n] + '\'';
                        }
                    }

                    var query = "INSERT INTO " + table + " (" + rowsString + ") VALUES (" + valuesString + ")";
                   
                    connection.query(query, null, function(err, rows, fields) {
                        if (err) {
                            callback({
                                statusCode: 500,
                                response: {
                                    result: 'error',
                                    err: err.code || 000,
                                    errorText: "Error occured"
                                }
                            });
                        } else {
                            callback({
                                statusCode: 200,
                                response: {
                                    result: 'success',
                                    err: '',
                                    //fields: fields,
                                    json: rows,
                                    length: rows.length
                                }
                            });
                        }
                        connection.release();
                    });
                }
            });
        },

        select: function(table, filter, limit, callback) {
            var limit = limit || 1;

            var filterString = '1';
            for (var n in filter) {
                filterString += ' AND ' + n + '=\'' + filter[n] + '\'';
            }

            
            var query = "SELECT * FROM " + table + " WHERE " + filterString;
            if (limit >0 ){
            	query +=" LIMIT " + limit;
            }
	    console.log(query);
            this.connectionpool.getConnection(function(err, connection) {
                if (err) {
                    console.dir(err);
                    callback({
                        statusCode: 500,
                        response: {
                            result: 'error',
                            err: err.code || 000,
                            errorText: "Error occured - no connection"
                        }
                    });
                } else {
                    connection.query(query, null, function(err, rows, fields) {
                        if (err) {
                            callback({
                                statusCode: 500,
                                response: {
                                    result: 'error',
                                    err: err.code || 000,
                                    errorText: "Error occured - bad query"
                                }
                            });
                        } else {
                            if (rows.length) {
                                callback({
                                    statusCode: 200,
                                    response: {
                                        result: 'success',
                                        err: '',
                                        //fields: fields,
                                        json: rows,
                                        length: rows.length
                                    }
                                });
                            } else {
                                callback({
                                    statusCode: 404,
                                    response: {
                                        result: 'error',
                                        err: 000,
                                        errorText: "Error occured - no rows"
                                    }
                                });
                            }
                        }
                        connection.release();
                    });
                }
            });
        },

        update: function(table, values, filter, limit, callback) {
            var limit = limit || 1;

            var filterString;
            var valuesString = '';

            for (var n in filter) {
                if (!filterString) {
                    filterString = n + '=\'' + filter[n] + '\'';
                } else {
                    filterString += ' AND ' + n + '=\'' + filter[n] + '\'';
                }
            }


            for (var n in values) {
                valuesString += ', ' + n + '=\'' + values[n] + '\'';
            }

            var query = "UPDATE " + table + " SET " + valuesString.substr(2, valuesString.length) + " WHERE " + filterString + ((limit > 0)?" LIMIT " + limit:"");

            console.log(query);
            this.connectionpool.getConnection(function(err, connection) {
                if (err) {
                    callback({
                        statusCode: 500,
                        response: {
                            result: 'error',
                            err: err.code,
                            errorText: "Error occured"
                        }
                    });
                } else {
                    connection.query(query, null, function(err, rows, fields) {
                        if (err) {
                            callback({
                                statusCode: 500,
                                response: {
                                    result: 'error',
                                    err: err.code,
                                    errorText: "Error occured"
                                }
                            });
                        } else {
                        	//console.dir(rows.affectedRows);
//                        	if (rows.length) {
                            if (rows.affectedRows) {
                                callback({
                                    statusCode: 200,
                                    response: {
                                        result: 'success',
                                        err: '',
                                        fields: fields,
                                        json: rows,
                                        length: rows.length
                                    }
                                });
                            } else {
                                callback({
                                    statusCode: 401,
                                    response: {
                                        result: 'error',
                                        err: 000,
                                        errorText: "Error occured"
                                    }
                                });
                            }
                        }
                        connection.release();
                    });
                }
            });
        }

    };
})();
