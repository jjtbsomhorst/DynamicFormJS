function FormReader(formDefinition){
    
    this.formDefinition = formDefinition;
    this.inputTypes = ["text","number","date","time","password"];
    this.inputSelectors = ["checkbox","dropdown","radiobutton","multiselect"];
    this.buttonSelectors = ["submit","button"];
    this.formNode = null;
    this.sections = [];
    this.id = new Guid().toString();
    this.parser = new formulaParser();
    this.inputNodes = new Map();
    this.changeListeners = [];
}

FormReader.prototype.load = function(domNode){
    
    var rootNode = $("#"+domNode)[0];
    if(rootNode == null){
        
        return;
    }

    this.formNode= document.createElement("form");
    $(this.formNode).attr("id",this.id);
    $(this.formNode).submit(this.onSubmit.bind(this));
    $(this.formNode).css({"display":"none"});
    
    for(var i = 0; i < this.formDefinition.Fields.length;i++){

        var fieldDef = this.formDefinition.Fields[i];
        if(this.inputTypes.indexOf(fieldDef.type) >= 0){
            this.generateInputType(fieldDef);
        }
        
        if(this.inputSelectors.indexOf(fieldDef.type) >= 0){
            this.generateInputSelector(fieldDef);
        }

        if(this.buttonSelectors.indexOf(fieldDef.type)>= 0){
            this.generateButton(fieldDef);
        }



    }

    

    rootNode.appendChild(this.formNode);
    this.parseRenderLogic();
    this.parseComputedValues();
    
    $(this.formNode).css({"display":""});
}

FormReader.prototype.parseComputedValues = function(){
    for(var i = 0; i < this.formDefinition.Fields.length;i++){
        var fieldDef = this.formDefinition.Fields[i];
        if(fieldDef.hasOwnProperty("computed")){
            var computedValue = this.parser.parse(fieldDef,fieldDef.computed.value,true);
            $("#"+fieldDef.id).val(computedValue);
        }

    }
    
}


FormReader.prototype.parseRenderLogic= function(){
   for(var i = 0; i < this.formDefinition.Fields.length;i++){
        var fieldDef = this.formDefinition.Fields[i];
        var entry = this.inputNodes.get(fieldDef.id);
        
        $(entry.node).css({display: "none"});

        if(fieldDef.hasOwnProperty("rendered")){
            var renderDef = fieldDef.rendered;
            var currentNode = $("#"+fieldDef.id);
            if(this.inputNodes.has(renderDef.field)){
                var related = this.inputNodes.get(renderDef.field);
                var relatedDef = related.def;
                var relatedNode = $("#"+relatedDef.id);
                if($(relatedNode).val()[0] == renderDef.value){
                     $(entry.node).css({'display': ''});
                }
                var self = this;

               if(this.changeListeners.indexOf(relatedDef.id) < 0){
                   this.changeListeners.push(relatedDef.id);
                    $(relatedNode).on('change',function(){
                        self.parseRenderLogic();
                    });
               }            
            }            
        }else{
            $(entry.node).css({"display":""});
        }
   }
}

FormReader.prototype.onSubmit = function(event){
    event.preventDefault();
    console.log("submit!!!");
}

FormReader.prototype.generateInputSelector = function(fieldDef){
    
    if(fieldDef.type == "checkbox" || fieldDef.type == "radiobutton"){
        for(var i = 0; i < fieldDef.options.length;i++){
            var rowNode = document.createElement("div");

            var inputContainer = document.createElement("div");
            var labelContainer = this.generateLabel(fieldDef);

            var optionDef = fieldDef.options[i];
            var cbNode = document.createElement("input");
            $(cbNode).attr("id",fieldDef.id);
            $(cbNode).attr("type",fieldDef.type);
            if(fieldDef.type == "radiobutton"){
                $(cbNode).attr("type","radio");
            }
            


            this.setDefaultAttributes(fieldDef,cbNode);
            $(cbNode).val(optionDef.key);
            $(cbNode).html(optionDef.value);
            
            if(fieldDef.defaultValue == optionDef.key){
                $(cbNode).attr('checked',true);
            }
        
            inputContainer.appendChild(cbNode);


            rowNode.appendChild(labelContainer);
            rowNode.appendChild(inputContainer);
            this.inputNodes.set(fieldDef.id,{"def": fieldDef,"node":rowNode});            
            this.formNode.appendChild(rowNode);
        }


    }

    if(fieldDef.type == "dropdown" || fieldDef.type == "multiselect"){
        
        var rowNode = document.createElement("div");
        var labelNode = this.generateLabel(fieldDef);
        var inputContainer = document.createElement("div");

        var selectNode = document.createElement("select");
        $(selectNode).attr("id",fieldDef.id);


            var optionNode = document.createElement("option");
            $(optionNode).html("-");
            $(optionNode).val("-");
            selectNode.appendChild(optionNode);

        for(var i = 0; i < fieldDef.options.length;i++){
            var optionDef = fieldDef.options[i];
            var optionNode = document.createElement("option");
            $(optionNode).html(optionDef.value);
            $(optionNode).val(optionDef.key);

            if(fieldDef.defaultValue == optionDef.key){
                $(optionNode).attr("selected",true);
            }

            selectNode.appendChild(optionNode);
            

        }

        if(fieldDef.type == "multiselect"){
            $(selectNode).attr("multiple","multiple");
        }
        
        inputContainer.appendChild(selectNode);
        rowNode.appendChild(labelNode);
        rowNode.appendChild(inputContainer)
        this.formNode.appendChild(rowNode);
        this.inputNodes.set(fieldDef.id,{"def": fieldDef,"node":rowNode});            
    }   
}

FormReader.prototype.setDefaultAttributes = function(fieldDef,inputNode){
    if(fieldDef.hasOwnProperty('placeHolder')){
        $(inputNode).attr("placeHolder",fieldDef.placeHolder);
    }

    if(fieldDef.hasOwnProperty("name") && fieldDef.name != ""){
        $(inputNode).attr("name",fieldDef.name);
    }

    $(inputNode).attr("id",fieldDef.id);

    
    if(fieldDef.required == true){
        $(inputNode).attr("required","required");
    }
}

FormReader.prototype.generateLabel = function(fieldDef){
    var labelContainer = labelContainer = document.createElement("div");

    if(fieldDef != null && fieldDef.hasOwnProperty("label") && fieldDef.label != ""){
        var labelNode = document.createElement("label");
        $(labelNode).attr("for",fieldDef.id);
        $(labelNode).html(fieldDef.label);
        labelContainer.appendChild(labelNode);
        
    }
    return labelContainer;
}

FormReader.prototype.generateInputType = function(fieldDef){
    
    var rowNode = document.createElement("div");
    rowNode.appendChild(this.generateLabel(fieldDef));
    
    var inputContainer =  document.createElement("div");
    var inputNode = document.createElement("input");
    
    this.setDefaultAttributes(fieldDef,inputNode);
    $(inputNode).attr("type",fieldDef.type);
    if(fieldDef.hasOwnProperty('defaultValue')){
        $(inputNode).val(fieldDef.defaultValue);
    }
    


    inputContainer.appendChild(inputNode);
    rowNode.appendChild(inputContainer);
    this.formNode.appendChild(rowNode);

    this.inputNodes.set(fieldDef.id,{"def": fieldDef,"node":rowNode});            

}

FormReader.prototype.generateButton = function(fieldDef){
    var rowNode = document.createElement("div");
    var celNode = document.createElement("div");
    var inputNode = null;
    if(fieldDef.type == "submit"){
        inputNode = document.createElement("input");
        $(inputNode).attr("type","submit");
    }
    if(fieldDef.type == "button"){
        inputNode = document.createElement("button");
    }

    $(inputNode).val(fieldDef.label);

    celNode.appendChild(inputNode);
    rowNode.appendChild(this.generateLabel(null));
    rowNode.appendChild(celNode);
    this.formNode.appendChild(rowNode);

    this.inputNodes.set(fieldDef.id,{"def": fieldDef,"node":rowNode});

}