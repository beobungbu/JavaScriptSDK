/*
  CloudTable
 */

CB.CloudTable = function(tableName){  //new table constructor

  CB._tableValidation(tableName);
  this.document = {};
  this.document.name = tableName;
  this.document.appId = CB.appId;
  this.document._type = 'table';

  if(tableName.toLowerCase() === "user") {
      this.document.type = "user";
      this.document.maxCount = 1;
  }
  else if(tableName.toLowerCase() === "role") {
      this.document.type = "role";
      this.document.maxCount = 1;
  }
  else {
      this.document.type = "custom";
      this.document.maxCount = 9999;
  }
  this.document.columns = CB._defaultColumns(this.document.type);
};

Object.defineProperty(CB.CloudTable.prototype,'columns',{
    get: function(){
        return this.document.columns;
    }
});

Object.defineProperty(CB.CloudTable.prototype,'name',{
    get: function(){
        return this.document.name;
    },
    set: function(){
        throw "You can not rename a table";
    }
});


CB.CloudTable.prototype.addColumn = function(column){
    if(Object.prototype.toString.call(column) === '[object String]') {
        var obj = new CB.Column(column);
        column = obj;
    }
  if (Object.prototype.toString.call(column) === '[object Object]') {
    if(CB._columnValidation(column, this))
      this.document.columns.push(column);

  } else if (Object.prototype.toString.call(column) === '[object Array]') {
      for(var i=0; i<column.length; i++){
        if(CB._columnValidation(column[i], this))
          this.document.columns.push(column[i]);
      }
  }
};

CB.CloudTable.prototype.getColumn = function(columnName){
    if(Object.prototype.toString.call(columnName) !== '[object String]') {
        throw "Should enter a columnName";
    }
    var columns = this.document.columns;
    for(var i=0;i<columns.length;i++){
        if(columns[i].name === columnName)
            return columns[i];
    }
    throw "Column Does Not Exists";
};

CB.CloudTable.prototype.updateColumn = function(column){
    if (Object.prototype.toString.call(column) === '[object Object]') {
        if (CB._columnValidation(column, this)){
            var columns = this.document.columns;
            for(var i=0;i<columns.length;i++){
                if(columns[i].name === column.name){
                    columns[i] = column;
                    this.document.columns = columns;
                    break;
                }
            }
        }else{
            throw "Invalid Column";
        }
    }else{
        throw "Invalid Column";
    }

};


CB.CloudTable.prototype.deleteColumn = function(column){
    if(Object.prototype.toString.call(column) === '[object String]') {
        var obj = new CB.Column(column);
        column = obj;
    }
  if (Object.prototype.toString.call(column) === '[object Object]') {
        if(CB._columnValidation(column, this)){
            var arr = [];
            for(var i=0;i<this.columns.length;i++){
                if(this.columns[i].name !== column.name)
                    arr.push(this.columns[i]);
            }
          this.document.columns = arr;
        }

  } else if (Object.prototype.toString.call(column) === '[object Array]') {
      var arr = [];
      for(var i=0; i<column.length; i++){
        if(CB._columnValidation(column[i], this)){
            for(var i=0;i<this.columns.length;i++){
                if(this.columns[i].name !== column[i].name)
                    arr.push(this.columns[i]);
            }
            this.document.columns = arr;
        }
      }
  }
};

/**
 * Gets All the Tables from an App
 *
 * @param callback
 * @returns {*}
 */

CB.CloudTable.getAll = function(callback){
  if (!CB.appId) {
      throw "CB.appId is null.";
  }

  var def;
  if (!callback) {
      def = new CB.Promise();
  }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var url = CB.serviceUrl+'/'+CB.appId +"/table";
  CB._request('POST',url,params,true).then(function(response){
    response = JSON.parse(response);
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
}

/**
 * Gets a table
 *
 * @param table
 *  It is the CloudTable object
 * @param callback
 * @returns {*}
 */


CB.CloudTable.get = function(table, callback){
  if(Object.prototype.toString.call(table) === '[object String]') {
      var obj = new CB.CloudTable(table);
      table = obj;
  }
  if (Object.prototype.toString.call(table) === '[object Object]') {
    {
      if (!CB.appId) {
          throw "CB.appId is null.";
      }

      var def;
      if (!callback) {
          def = new CB.Promise();
      }

      var params=JSON.stringify({
          key: CB.appKey,
          appId: CB.appId
      });

      var url = CB.serviceUrl + '/' + CB.appId + "/table/" + table.document.name;
      CB._request('POST',url,params,true).then(function(response){
          if(response === "null"){
            obj = null;
        }else{
            response = JSON.parse(response);
            var obj = CB.fromJSON(response);
        }
          if (callback) {
              callback.success(obj);
          } else {
              def.resolve(obj);
          }
      },function(err){
          if(callback){
              callback.error(err);
          }else {
              def.reject(err);
          }
      });
      if (!callback) {
          return def;
      }

    }
  } else if (Object.prototype.toString.call(table) === '[object Array]') {
    throw "cannot fetch array of tables";
  }
}


/**
 * Deletes a table from database.
 *
 * @param table
 * @param callback
 * @returns {*}
 */

CB.CloudTable.prototype.delete = function(callback){
    if (!CB.appId) {
        throw "CB.appId is null.";
    }

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey,
        name: this.name
    });

    var thisObj = this;

    var url = CB.serviceUrl + '/' + CB.appId + "/table/" +this.name;

    CB._request('DELETE',url,params,true).then(function(response){
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
    if (!callback) {
        return def;
    }
}

/**
 * Saves a table
 *
 * @param callback
 * @returns {*}
 */

CB.CloudTable.prototype.save = function(callback){
  var def;
  if (!callback) {
      def = new CB.Promise();
  }
  CB._validate();
  var thisObj = this;
  var params=JSON.stringify({
      key:CB.appKey,
      data:CB.toJSON(thisObj)
  });

  var thisObj = this;

  var url = CB.serviceUrl +'/' + CB.appId + "/table/" + thisObj.document.name;

    CB._request('PUT',url,params,true).then(function(response){
      response = JSON.parse(response);
      thisObj = CB.fromJSON(response);
      if (callback) {
          callback.success(thisObj);
      } else {
          def.resolve(thisObj);
      }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });

  if (!callback) {
      return def;
  }
};



