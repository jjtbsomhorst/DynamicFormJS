function formulaParser(){

}



formulaParser.prototype.parse = function(fieldDef,formula,attachListener){
    var regex = new RegExp("\{{(\s*?.*?)*?\}}");
    var parsedFormula = formula;
    while(regex.test(parsedFormula)){
            
            var oldValue = regex.exec(parsedFormula)[0];
            var newValue = oldValue;
            newValue = newValue.replace("{{","");
            newValue = newValue.replace("}}","");
            if($("#"+newValue).length){ //  we have an input value
                var sourceNode = null;
                var dependantNode = $("#"+newValue);
                if($("#"+fieldDef.id).length){
                    sourceNode = $("#"+fieldDef.id)[0];
                }
                if(attachListener){
                    if(sourceNode != null){
                        var self = this;
                        var fieldDef = fieldDef;
                        var formula = formula;


                        $("#"+newValue).bind("keyup mouseup",function(){
                            var parsedValue = self.parse(fieldDef,formula,false);
                            if(parsedValue == "" && fieldDef.hasOwnProperty("defaultValue")){
                                parsedValue = fieldDef.defaultValue;
                            }


                            $("#"+fieldDef.id).val(self.parse(fieldDef,formula,false));
                        });
                    }
                }
                newValue = dependantNode.val();
            }
            parsedFormula = parsedFormula.replace(oldValue, newValue);
    }
    try{
        return eval(parsedFormula);
    }catch(e){

    }
    return "";
}

