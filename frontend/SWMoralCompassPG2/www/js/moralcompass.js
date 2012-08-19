var GOODGUIDE_API_KEY = "9pvn6sg96kqx9gpnzt46a2mc";
var GOOGLE_API_KEY = "AIzaSyBbif9QAPwKnf2YEv-P6xQtlYrMDpotzCY";

// namespace for all things Moral Compass
MCApp = {};

MCApp.isDebug = function(){return true};

MCApp.getUrlForAPI = function(){
    return "http://127.0.0.1/";
}

MCApp.currentBarcode = false;
MCApp.currentCompanyName = false;
MCApp.currentProductName = false;

/**
 *  Scans a barcode and calls a handler.
 *  
 *  void -> void
 */
MCApp.scanBarcode = function(){
   MCApp.scanBarcodeWithScandit();
}

MCApp.getCurrentBarcode = function(){
    return MCApp.currentBarcode;
}

/**
 *  The handler, called after a company has been found.
 *  
 *  This should be in the success callbacks of the barcode scanning functions.
 *  
 *  void -> void
 */
MCApp.handleUpdateAfterCompanyFound = function(){
    // Update/replace me as needed!
    alert("update handled");
}

MCApp.handleScannerCancelOrFail = function(){
    alert("replace this cancel placeholder function!");
}

MCApp.getCurrentBarcode = function(){
    return MCApp.currentBarcode;
}

MCApp.getCurrentCompanyName = function(){
    return MCApp.currentCompanyName;
}

MCApp.scanBarcodeWithScandit = function(){
    var SCANDIT_APP_KEY = "nIGuaOlnEeGXNUEZL6NnwOyanGE2nEdWOtIrkDGfuVs";
     ScanditSDK.nativeFunction(MCApp.scanBarcodeSuccessScandit,
                              MCApp.scanBarcodeFailScandit,
                              SCANDIT_APP_KEY, {
                                          "beep": true, 
                                          "1DScanning" : true, 
                                          "2DScanning" : true, 
                                          "scanningHotspot" : "0.5/0.5", 
                                          "vibrate" : true, 
                                          "showMostLikelyBarcodeUIElement" : false,
                                          "textForMostLikelyBarcodeUIElement" : "Most likely barcode",
                                          "textForInitialScanScreenState" : "Align code with box",
                                          "textForBarcodePresenceDetected" : "Align code and hold still",
                                          "textForBarcodeDecodingInProgress" : "Decoding",
                                          "searchBarActionButtonCaption" : "Go",
                                          "searchBarCancelButtonCaption" : "Cancel",
                                          "searchBarPlaceholderText" : "Scan barcode or enter it here",
                                          "toolBarButtonCaption" : "Cancel",
                                          "viewfinderColor" : "FFFFFF",
                                          "viewfinderDecodedColor" : "00FF00",
                                          "minSearchBarBarcodeLength" : 8,
                                          "maxSearchBarBarcodeLength" : 15
                                          });
}

/**
 *  Function to handle barcode scanning success.
 *  
 *  void -> 
 */
MCApp.scanBarcodeSuccessScandit = function(concatResult){
    var resultArray = concatResult.split("|"); 
    MCApp.currentBarcode = resultArray[1];
    MCApp.getCompanyNameFromBarcode(MCApp.currentBarcode, function(companyName) {
        MCApp.currentCompanyName = companyName;
        MCApp.handleUpdateAfterCompanyFound();
        
    });
}

/**
 *  Function to handle barcode scanning failure.
 *  
 *  void -> false
 */
MCApp.scanBarcodeFailScandit = function(){
    MCApp.currentBarcode = false;
    MCApp.handleScannerCancelOrFail();
}

/**
 *  Produces a company name from a barcode result.
 *  
 */
MCApp.getCompanyNameFromBarcode = function(barcodeStr, callback){
    MCApp.getCompanyNameFromBarcodeLocal(barcodeStr, function(companyName) {
        if (companyName)
            callback(companyName);
        else
            MCApp.getCompanyNameFromBarcodeRemote(barcodeStr, callback);
        
        MCApp.currentCompanyName = companyName;
    });
}

/**
 *  Produces a locally-stored company name or "unknown"
 *  
 *  string -> string
 */
MCApp.getCompanyNameFromBarcodeLocal = function(barcodeStr, callback) {
    var code = $.trim(barcodeStr);
        if(code == "070847009047"){
            callback("Startup Weekend");
            return;
        }
    
        // more general
        // 8->3 13->6
	if (code.indexOf("004800") === 0) callback("Unilever");
	else if (code.indexOf("055000") === 0) callback("Nestle");
	else if (code.indexOf("004229") === 0) callback("Urban Outfitters");
	else if (code.indexOf("038000") === 0) callback("Kellogg");
        else if (code.indexOf("057961") === 0) callback("Sun-Rype Products"); 
        
        // specific products at startup weekend
        else if (code == "065633073814") callback("Nature Valley");
        else if (code == "070847002901") callback("Monster Beverage");
        else if (code == "057961023517") callback("Sun-Rype Products");
        
    else callback(false);
}

/**
 *  Produces a company name from an external database, or false
 *  
 */
MCApp.getCompanyNameFromBarcodeRemote = function(barcodeStr, callback) {
    //MCApp.getProductInfoFromGoodGuide(barcodeStr, callback);
    MCApp.getProductInfoFromGoogle(barcodeStr, callback);
}

/**
 *  Produces a product name and company name from a barcode result.
 */
MCApp.getProductInfoFromGoodGuide = function(barcodeStr, callback) {
    console.log("API call: " + 'http://api.goodguide.com/search.xml?api_key=' + GOODGUIDE_API_KEY + "&api_version=1.0&upc=" + barcodeStr)
    $.ajax({
            type: "GET",
            url: 'http://api.goodguide.com/search.xml?api_key=' + GOODGUIDE_API_KEY + "&api_version=1.0&upc=" + barcodeStr,
            dataType: "xml",
            success: function(xml) {
                MCApp.currentProductName = $xml.find("name").text();
                var id = $xml.find("id").text();
                if (id)
                    MCApp.getCompanyNameFromGoodGuideID(id, callback);
                else
                    callback(false);
                console.log("Found product: " + MCApp.currentProductName);
            }
    });
}

MCApp.getCompanyNameFromGoodGuideID = function(id, callback) {
    console.log("API call: " + 'http://api.goodguide.com/search.xml?api_key=' + GOODGUIDE_API_KEY + "&api_version=1.0&id=" + id);
    $.ajax({
            type: "GET",
            url: 'http://api.goodguide.com/search.xml?api_key=' + GOODGUIDE_API_KEY + "&api_version=1.0&id=" + barcodeStr,
            dataType: "xml",
            success: function(xml) {
                MCApp.currentCompanyName = false;
                var parents = $xml.find("parents");
                parents.each(function() {
                    var entity = $(this).find("entity");
                    entity.each(function() {
                        var type = $(this).attr("entity_type");
                        if (type == "company")
                            MCApp.currentCompanyName = $(entity).find("name");
                    });
                });

                if (MCApp.currentCompanyName) {
                    callback(MCApp.currentCompanyName);
                    console.log("Found copmany: " + MCApp.currentCompanyName);
                }
            }
    });
}

/**
 *  Produces a product name from a barcode result.
 */
//MCApp.getProductNameFromScandit = function(barcodeStr) {
//    var SCANDIT_PRODUCT_API_KEY = "j_bi-cHjpvbLQopyEOQjJ068Z8yLf2KXKdrzoBvqX-g";
//    $.getJSON('https://api.scandit.com/v1/products/' + barcodeStr + '?key=' + SCANDIT_PRODUCT_API_KEY, function(data) {
//         MCApp.currentProductName = data.name;
//         MCApp.currentCompanyName = "unknown";
//         console.log("Found product: " + MCApp.currentProductName);
//    })
//    .error(function(jqXHR, textStatus, errorThrown) { alert("Error getting product information: " + errorThrown); });
//}

MCApp.getProductInfoFromGoogle = function(barcodeStr, callback) {
    var request = "https://www.googleapis.com/shopping/search/v1/public/products?key=" + GOOGLE_API_KEY + "&country=US&restrictBy=gtin%3A" + barcodeStr;
    console.log("API call: " + request);
    $.getJSON(request, function(json) {
        console.log(json);
        if (json.items) {
            MCApp.currentProductName = json.items[0].product.title;
            MCApp.currentCompanyName = json.items[0].product.brand;
            callback(MCApp.currentCompanyName);
        } else {
            callback(false);
        }
    });
}

MCApp.getCompanyBeliefs = function(companyName){
    var result = MCApp.getCompanyBeliefsFromLocal(companyName);
    if(result === false){
        result = MCApp.getCompanyBeliefsFromServer(companyName);
    }
    return result;
}

MCApp.getCompanyBeliefsFromLocal = function(companyName){
    if(companyName == "Nature Valley"){
        return [MCStance.yes(), MCStance.yes(), MCStance.donotcare(), MCStance.donotcare(), MCStance.donotcare()];
    }else{
        return false;
    }
}

/**
 *  Fetches company beliefs from the server.
 *  
 *  string -> array(<MCStance>)
 */
MCApp.getCompanyBeliefsFromServer = function(companyName){
    throw "unimplemented";
}

/**
 *  A dictionary for beliefs.
 * 
 */
MCBeliefDictionary = {};
MCBeliefDictionary.beliefArray = [
                                    "same sex marriage",
                                    "testing on animals",
                                    "use of child labour",
                                    "government-set minimum wage",
                                    "healthy living",
                                    "planet earth",
                                    "gay marriage",
                                    "animal rights",
                                    "fair trade",];
MCBeliefDictionary.getBeliefForId = function(idx){
    if(idx < 0 || idx >= MCBeliefDictionary.beliefArray.length) return "unknown";
    return MCBeliefDictionary.beliefArray[idx];
}
MCBeliefDictionary.getNumBeliefs = function(){
    return MCBeliefDictionary.beliefArray.length;
}

/**
 *  A stance on an issue.
 */
MCStance = {};
MCStance.yes = function(){
    return 0;
}
MCStance.no = function(){
    return 1;
}
MCStance.donotcare = function(){
    return 2;
}

/**
 *  Container for belief array
 * 
 */
MCBeliefs = function(){
    this.arrayOfBeliefs = [];
    this.init();
    this.saveKey = "MC_Stances";
    this.isLoaded = false;
    
    this.init();
}

/**
 *  Initialize to "do not care" for all issues.
 * 
 *  void -> void
 */
MCBeliefs.prototype.init = function(){
    for(var i=0; i<MCBeliefDictionary.getNumBeliefs(); i++){
        // sets everything to do not care
        if(!MCApp.isDebug()){
            this.arrayOfBeliefs[i] = MCStance.donotcare();
        }else{
            this.arrayOfBeliefs[i] = Math.random()<.5?MCStance.no():MCStance.yes();
        }
    }
}

/**
 *  Validates whether an index is valid.
 *  
 *  int -> boolean
 */
MCBeliefs.prototype.isIssueIdxValid = function(idx){
    return idx >= 0 && idx < MCBeliefDictionary.getNumBeliefs();
}

/**
 *  Validates whether a stance is valid.
 *  
 *  MCStance -> boolean
 */
MCBeliefs.prototype.isStanceValid = function(stance){
    return stance == MCStance.yes() || stance == MCStance.no() || stance == MCStance.donotcare();
}

/**
 *  Sets a stance to an issue index.
 *  
 *  uint MCStance -> boolean
 */
MCBeliefs.prototype.setStance = function(issueIdx, stance){
    if(!this.isIssueIdxValid(issueIdx)) return false;
    if(!this.isStanceValid(stance)) return false;
    
    this.arrayOfBeliefs[issueIdx] = stance;
    return true;
}

/**
 *  Has anything ever been saved?
 * 
 *  void -> boolean
 */
MCBeliefs.prototype.isFirstTimeSave = function(){
    return window.localStorage.getItem(this.saveKey) == null;
}

MCBeliefs.prototype.isLoadedFromLastSave = function(){
    return this.isLoaded;
}

/**
 *  Save belief stances to local storage.
 *  
 *  If hasn't been loaded yet, fail to prevent writing blanks over stored data.
 *  
 *  void -> boolean
 */
MCBeliefs.prototype.save = function(){
    if(!this.isLoadedFromLastSave()) return false;
    window.localStorage.setItem(this.saveKey, JSON.stringify(this.getStances()));
    return true;
}

/**
 *  Produces the currently stored array of stances.
 *  
 *  void -> array(<MCStance>)
 */
MCBeliefs.prototype.getStances = function(){
    return this.arrayOfBeliefs;
}

/**
 *  Get a stance at an index.
 *  
 *  uint -> MCStance or false
 */
MCBeliefs.prototype.getStanceAtIdx = function(idx){
    if(!this.isIssueIdxValid(idx)) return false;
    return this.arrayOfBeliefs[idx];
}

/**
 *  Load belief stances from local storage.
 *  
 *  If nothing has been saved initially, save stuff.
 * 
 *  void -> boolean
 */
MCBeliefs.prototype.load = function(){
    this.setToLoaded();
    if(this.isFirstTimeSave()){this.save();}
    this.arrayOfBeliefs = JSON.parse(window.localStorage.getItem(this.saveKey));
    return true;
}

MCBeliefs.prototype.setToLoaded = function(){
    this.isLoaded = true;
}

/**
 *  Produces the percent the stances agree with the company stances.
 * 
 *  array(<MCStance>) -> number
 */
MCBeliefs.prototype.getNumAgreeToArrayOfCompanyStances = function(stancesArray){
    if(stancesArray.length < this.getStances().length){
        if(MCApp.isDebug()) alert("error: size of array from server smaller than local array");
        return false;
    }
    
    var sumMatch = 0;
    
    for(var i=0; i<this.arrayOfBeliefs.length; i++){
        if(this.arrayOfBeliefs[i] == stancesArray[i] &&
           this.arrayOfBeliefs[i] != MCStance.donotcare() &&
           stancesArray[i] != MCStance.donotcare()){
            sumMatch ++;
        }
    }
    
    //alert(JSON.stringify(this.getStances())+"\n"+JSON.stringify(stancesArray));
    
    return sumMatch;
}

/**
 *  Produces the string representation of the array of stances.
 * 
 *  void -> string
 */
MCBeliefs.prototype.toString = function(){
    return JSON.stringify(this.arrayOfBeliefs);
}

/**
 *  Test data generator.
 */
MCTest = function(){
    
}

/**
 *  Produces deterministic test stances from a barcode
 * 
 *  barcode -> array(<MCStance>)
 */
MCTest.prototype.getTestStancesFromBarcode = function(barcode){
    var size = MCBeliefDictionary.getNumBeliefs();
    var toyData = [];
    for(var i=0; i<size; i++){
        toyData[i] = parseInt(barcode.charAt(i))%3;
    }
    
    return toyData;
}

MCTest.prototype.getTestStancesFromCompanyName = function(companyName){
    companyName = companyName.toLocaleString();
    var size = MCBeliefDictionary.getNumBeliefs();
    var toyData = [];
    for(var i=0; i<min(size, companyName.length); i++){
        toyData[i] = companyName.charAt(i)%3;
    }
    
    if (companyName.length < size) {
        for(var j=companyName.length; j<size; j++){
            toyData[j] = 1;
        }
    }
    
    return toyData;
}

/**
 *  View controller for summary view.
 */
MCSummaryViewController = function(){
    
    // Constants
    this.viewContainerId = "mc-container-summary";
    
    // State
    this.company = "unknown";
    this.percentAgree = 0;
    this.percentUsersAgree = 0;
    this.isSupport = false;
    
    /**
     *  What word describes agreeing or disagreeing?
     * 
     *  void -> string
     */
    this.getDescriptionWord = function(){
        var type = this.getIndicatorType();
        if(type == "support"){
            return "buddies";
        }else if(type == "oppose"){
            return "adversaries";
        }else if(type == "neutral"){
            return "neutral";
        }else return "unknown";
    }
    
    /**
     *  Sets the company name.
     *  
     *  string -> void
     */
    this.setCompanyName = function(companyName){
        this.company = companyName;
    }
    
    /**
     *  Sets the percent the user agree.
     *  
     *  uint -> void
     */
    this.setPercentAgree = function(percent){
        this.percentAgree = percent;
    }
    
    /**
     *  Sets the percent other users agree.
     *  
     *  uint -> void
     */
    this.setPercentUsersAgree = function(percent){
        this.percentUsersAgree = percent;
    }
    
    /**
     *  Sets whether this company is supported by the user.
     *  
     *  boolean -> void
     */
    this.setIsSupport = function(isSupport){
        this.isSupport = isSupport;
    }
    
    /** getters **/
    this.getCompanyName = function(){return this.company;}
    this.getPercentAgree = function(){return this.percentAgree;}
    this.getPercentUsersAgree = function(){return this.percentUsersAgree;}
    
    /**
     *  Updates the view with the information in this controller.
     *  
     *  void -> void
     */
    this.updateView = function(){
        
        if(MCApp.isDebug()){
            /*
            this.setPercentUsersAgree(this.getCompanyName().length*2*10%100);
            */
            this.setPercentUsersAgree(66);
        }
        
        var isCompanyKnown = this.getCompanyName() != null && this.getCompanyName() != 'unknown';
        
        if(this.getDescriptionWord()!="unknown"){
            $('#mc-support-description').html(this.getCompanyName().charAt(0).toUpperCase() 
                                             + this.getCompanyName().slice(1) + " and you are "
                                             + this.getDescriptionWord() + ".");
        }else{
            $('#mc-support-description').html("We're still learning about " + isCompanyKnown?this.getCompanyName():"this company.");
        }
        $('#mc-support-user-agree-text-percent').html(Math.floor(this.getPercentAgree())+'%');
        $('#mc-support-others-agree-text-percent').html(Math.floor(this.getPercentUsersAgree())+'%');
        
        
        this.updateBarChart();
        this.updateSupportIndicator();
        this.updateOthersAgreeVisualization();
    }
    
    this.updateBarChart = function(){
        $('#mc-summary-chart-data').width(this.getPercentAgree()+"%");
    }
    
    this.getIndicatorType = function(){
        if(this.getPercentAgree() > 50) return "support";
        else if(this.getPercentAgree() < 50) return "oppose";
        else if(this.getPercentAgree() == 50) return "neutral";
        // add case for all "don't care" matches
        else return "dontknow";
    }
    
    this.updateSupportIndicator = function(){
        var type = this.getIndicatorType();
        
        // TODO: move this somewhere that makes more sense
        var types = ["support", "oppose", "neutral", "dontknow"],
            div = $('#mc-support-indicator'),
            container = div.parent(),
            str = div.find('span');
        
        // remove all, then add relevent type
        for(var i=0; i<types.length; i++){
            container.removeClass(types[i]);
        }
        container.addClass(type);
        
        if(type == "support"){
            str.html("support");
        }else if(type == "oppose"){
            str.html("oppose");
        }else if(type == "neutral"){
            str.html("your choice");
        }else{
            str.html("whoops");
        }
    }
    
    this.updateOthersAgreeVisualization = function(){
        // unimplemented
    }
        
    
    /**
     * Quiz view controller.
     * 
     * Example Html below:
     * 
     * <div class="question">
            
               <h2>Same-sex marriage:</h2> 
               
               <ul class="choice">
                   <li>
                       <a href="#" class="button support">Support</a>
                   </li>
                   <li>
                       <a href="#" class="button dontcare">Don't care</a>
                   </li>
                   <li>
                       <a href="#" class="button oppose">Oppose</a>
                   </li>
               </ul>
	           
	       </div>
	       
	       <div class="question">
	       
	           <h2>Testing on animals:</h2> 
	           <ul class="choice">
	               <li>
	                   <a href="#" class="button support">Support</a>
	               </li>
	               <li>
	                   <a href="#" class="button dontcare">Don't care</a>
	               </li>
	               <li>
	                   <a href="#" class="button oppose">Oppose</a>
	               </li>
	           </ul>
	           
	       </div>
	       
	       <div class="question">
	       
	           <h2>Use of child labour:</h2> 
	           <ul class="choice">
	               <li>
	                   <a href="#" class="button support">Support</a>
	               </li>
	               <li>
	                   <a href="#" class="button dontcare">Don't care</a>
	               </li>
	               <li>
	                   <a href="#" class="button oppose">Oppose</a>
	               </li>
	           </ul>
	           
	       </div>
	       
	       <div class="question">
	       
	           <h2>Government-set minimum wage:</h2> 
	           <ul class="choice">
	               <li>
	                   <a href="#" class="button support">Support</a>
	               </li>
	               <li>
	                   <a href="#" class="button dontcare">Don't care</a>
	               </li>
	               <li>
	                   <a href="#" class="button oppose">Oppose</a>
	               </li>
	           </ul>
	           
	       </div>
     */
    MCQuizViewController = function(){
        this.arrOfIssues =
            ["same-sex marriage",
             "testing on animals",
             "use of child labour",
             "government-set minimum wage"];
        
        /**
         *  Produces a section that represents a quiz question.
         *  
         *  string -> string
         */
        this.getHtmlForIssue = function(theIssue){
            var theIssueSentenceCase = theIssue.charAt(0).toUpperCase() 
                                             + theIssue.slice(1).toLowerCase();
            var questionSection =
                '<div class="question mc-quiz-question">\n'+
	           '<h2>'+theIssueSentenceCase+'</h2>\n'+
	           '<ul class="choice">\n'+
	               '<li><a href="#" class="button support">Support</a></li>\n'+
	               '<li><a href="#" class="button dontcare">Don\'t care</a></li>\n'+
	               '<li><a href="#" class="button oppose">Oppose</a></li>\n'+
	           '</ul>\n</div>\n';
            return questionSection;
        }
        
        /**
         *  Produces the html for an entire quiz.
         *  
         *  This is based on what issues are currently stored in the internal
         *  array.
         *  
         *  void -> string
         */
        this.produceQuizHtml = function(){
            var result = "";
            for(var i=0; i<this.arrOfIssues; i++){
                result = result + this.getHtmlForIssue(this.arrOfIssues[i]);
            }
            return result;
        }
    }
    
}
