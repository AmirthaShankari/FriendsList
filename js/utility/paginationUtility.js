function Pagination(data, recordsPerPage, sortFields, sortFieldsId, searchFields, searchFieldsId, isautoComplete, alphabeticalFilterField) {

    this.data  = data;
    this.recordsPerPage = recordsPerPage;
    this.currentPage = 1;
    this.sortFields = sortFields;
    this.sortFieldsId =  sortFieldsId;
    this.searchFields = searchFields;
    this.searchFieldsId = searchFieldsId;
    this.isautoComplete = isautoComplete;
    this.alphabeticalFilterField = alphabeticalFilterField;
    this.alphabetFilter = ""; 
    var outputData = {}, processedData = [], autoCompleteResult = [];

    //BEGIN :: reset output data
    var resetData = function(){
        outputData = {
            totalPageCount : 1,
            currentPage : 1,
            data : [],
            dataLength : 0,
            autoCompleteResult : [],
            alphabeticalFilter : "",
            status : undefined,
            errorMsg : undefined
        }
        processedData = undefined;
        autoCompleteResult = [];
    }
    //END reset output data

    //BEGIN :: set output data
    var setOutputData = function(pageCount, currPage, currPageData, totalRecords, autoCompleteData, alphabeticalFilterValue){
        outputData.totalPageCount = pageCount;
        outputData.currentPage = currPage;
        outputData.data = currPageData.slice();
        outputData.dataLength = totalRecords;
        outputData.autoCompleteResult = autoCompleteData.slice();
        outputData.alphabeticalFilter = alphabeticalFilterValue;
        outputData.status = "success";
        outputData.errorMsg = "";
        consoleUtility.log("opdata" + JSON.stringify(outputData));
    }
    //END :: set output data

    //BEGIN :: set output data error message
    var setOutputDataErrorMsg = function(errMsg){
        resetData.call(this);
        outputData.status = "error";
        outputData.errorMsg = errMsg;
    }
    //END :: set output data error message

    //BEGIN :: Function for dynamic sorting
    var compareValuesForSort = function(key, order) {
        return function(a, b) {
        if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0; 
        }    
        const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
    
        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order == 'desc') ? (comparison * -1) : comparison
        );
        };
    }
    //END :: Function for dynamic sorting

    //BEGIN :: process data using search criteria
    var processData = function(){
        var tempData = [];
        var tempProcessedData = [];
        tempData = this.data.slice();
        resetData.call(this);

        //BEGIN :: alphabetical filter
        if(this.alphabeticalFilterField !== "" && this.alphabeticalFilterField !== undefined && this.alphabetFilter !== ""){
            for(let j = 0; j < tempData.length; j++){
                if(tempData[j][this.alphabeticalFilterField].startsWith(this.alphabetFilter)){
                    tempProcessedData.push(tempData[j]);
                }
            }
            tempData = tempProcessedData.slice();
            tempProcessedData.length = 0;
        }
        //END :: alphabetical filter

        //BEGIN :: Perform search operation on data 
        for(let i = 0; i < this.searchFields.length; i++){
            let searchElementValue = $(this.searchFieldsId[i]).val();
            if(searchElementValue !== ''){
                for(let j = 0; j < tempData.length; j++){
                    if((tempData[j][this.searchFields[i]]).toUpperCase().includes(searchElementValue.toUpperCase())){
                        tempProcessedData.push(tempData[j]);
                    }
                }
                tempData = tempProcessedData.slice();
                tempProcessedData.length = 0;
            }
        }
        //END :: Perform search operation on data 
        //BEGIN :: Perform sort operation on data
        for(let i = 0; i < this.sortFields.length; i++){
            let sortOrder = $(this.sortFieldsId[i]).attr("sort");
            if(sortOrder === "asc" || sortOrder === "desc"){
                tempData.sort(compareValuesForSort.call(this, this.sortFields[i], sortOrder));
            }
            
        }
        //END :: Perform sort operation on data
        //BEGIN :: Populate autocomplete data
        for(let i = 0; i < this.searchFields.length; i++){
            let autoCompleteArr = [];
            for(let j = 0; j < tempData.length; j++){
                autoCompleteArr.push(tempData[j][this.searchFields[i]]);
            }
            autoCompleteResult.push(autoCompleteArr.slice());
        }
        //END :: Populate autocomplete data
        processedData = tempData.slice();
    }
    //END :: process data usinf search criteria

    //BEGIN :: Function to return the total number of pages based on limit
    var numberOfPages = function (){
        return Math.ceil(processedData.length / this.recordsPerPage);
    }
    //END :: Function to return the total number of pages

    //BEGIN :: Function to provide the specified page content
    var providePageContent = function(){
        var pageData = [];
        for(let i = (this.currentPage - 1) * this.recordsPerPage; i < (this.currentPage * this.recordsPerPage); i++){
            pageData.push(processedData[i]);
        }
        pageData = pageData.filter(function( element ) {
            return element !== undefined;
        });
        setOutputData.call(this, numberOfPages.call(this), this.currentPage, pageData.slice(), processedData.length, autoCompleteResult.slice(), this.alphabetFilter);
        consoleUtility.log("Output Data from pagination: " + JSON.stringify(outputData));
        return outputData;
    }
    //END :: Function to provide the specified page content

    //BEGIN :: Function to update data
    this.updateData = function(id, value, field){
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i]["id"] == id){
                this.data[i][field] = value;
            }
        }
    }
    //END :: Function to update data

    //BEGIN :: Function to render the specified page number content
    this.renderPage = function(page){
        processData.call(this);
        if(page <= numberOfPages.call(this) || page === 1){
            this.currentPage = page;
            return providePageContent.call(this);
        }else{
            setOutputDataErrorMsg.call(this,"Invalid page number!!");
            return outputData;
        }        
    }
    //END :: Function to render the specified page number content

    //BEGIN :: Function to render the previous page
    this.previousPage = function(){
        processData.call(this);
        if(this.currentPage > 1){
            this.currentPage -= 1;
        }
        return providePageContent.call(this);
        
    }
    //END :: Function to render the previous page

    //BEGIN :: Function to render the next page
    this.nextPage = function(){
        processData.call(this);
        consoleUtility.log("Next page : " + JSON.stringify(this.processedData));
        if(this.currentPage < numberOfPages.call(this)){
            this.currentPage += 1;
        }
        return providePageContent.call(this);
    }
    //END :: Function to render the next page

    //BEGIN :: Function to update alphabet filter
    this.updateAlphabetFilter = function(filterAlphabet){
        this.alphabetFilter = filterAlphabet;
    }
    //END :: Function to update alphabet filter

}