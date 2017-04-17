function TypeAheadReader(fieldDef){
    this.fieldDef = fieldDef;
}

TypeAheadReader.prototype.findMatches = function(data){
    var x = this;
    return function(q,cb){
        console.log('looking for matches');
        return ['a','b','c','d','e'];
    }
    
}