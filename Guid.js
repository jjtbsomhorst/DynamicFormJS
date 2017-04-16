function Guid(){
    this.guid = null;
    this.sections = [];
}

Guid.prototype.generate = function(){
    return (this.generateGuidSection() + this.generateGuidSection() + "-" + this.generateGuidSection() + "-4" + this.generateGuidSection().substr(0,3) + "-" + this.generateGuidSection() + "-" + this.generateGuidSection() + this.generateGuidSection() + this.generateGuidSection()).toLowerCase();
}

Guid.prototype.generateGuidSection = function(){
    var tempSection = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    while(this.sections.indexOf(tempSection) >= 0){
        tempSection = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    this.sections.push(tempSection);
    return tempSection;

}

Guid.prototype.toString = function(){
    if(this.guid == null){
        this.guid = this.generate();
    }
    return this.guid;
}