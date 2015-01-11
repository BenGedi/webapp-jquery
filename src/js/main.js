
(function($) {
    'use strict';
    // functions declaration
    var getActiveTab,getActiveTabContent,settingsBtnHandler,addSelectOption,setHttp,
        isUrlValid,tabsEventHandler,removeInvalidClass,removeSelectOption,
        selectOptionHandler,formValidation,switchTabs,collectionClassHandler,
        setIframeAndExpendButton,formInputsHandler,initTabs,importData,exportData,init;

    // elements declaration
    var $TabsCollection = $('.tabs li a'),
        $TabsContentCollection = $('.tab'),
        $notification = $('.notifications').eq(0),
        $bookmarks = $('.bookmarks'),
        $tabContentIframe ,$btnExpand,
        $forms = $( '.frmSettings' ),
        $btnSettingTabs = $( '.tab .btn-settings' ),
        $currentTabContent,
        $currentTab;

    // variables declaration
    var emptyfieldsetsCounter,
        currentTabContentId;


    /*================================================
    TABS FUNCTIONS.
    ================================================*/

    getActiveTab = function($tabs){

        for(var i = 0; i< $tabs.length ;i++){
            if ($tabs.eq(i).hasClass( 'tab-active' )){
                return $tabs.eq(i);
            }
        }
    };

    getActiveTabContent = function($tabsContent){

        for (var i = 0; i < $tabsContent.length; i++) {
            if($tabsContent.eq(i).hasClass( 'hidden' )){
                continue;
            }
            else{
                return $tabsContent.eq(i);
            }
        }
    };

    /*
    * initTabs function update the current tab global variables
    *
    *  @param {element} tab - anchor tab.
    *  @param {element} tabContent - tab content.
    *  @param {string} tabContentId - tab content id.
    */
    initTabs = function($tab ,$tabContent,tabContentId){
        $currentTab = $tab;
        $currentTabContent = $tabContent;
        currentTabContentId = tabContentId ? tabContentId : $currentTabContent[0].id.slice(4);
        // exportData();
    };

    /*
    * switchTabs function is activate the tabs
    *
    *  @param {string} urlHashId - id from the target hash
    */
    switchTabs = function(urlHashId){

        // $aTag is the tab target
        var $targtTabContent = $( '#tab-' + urlHashId ),
            $aTag = $( '.tabs ul a[href="#'+urlHashId+'"]' );

        // remove class active form current tab
        $currentTab.removeClass( 'tab-active');
        // add class hidden to current tab content
        $currentTabContent.addClass( 'hidden' );

        location.hash = urlHashId;
        $aTag.addClass('tab-active');
        $targtTabContent.removeClass('hidden');
        initTabs($aTag,$targtTabContent,urlHashId);
    };

    /*================================================
    HELPER FUNCTIONS.
    ================================================*/

    removeInvalidClass = function($elm){
        if ($elm.hasClass( 'invalid' )){
            $elm.removeClass( 'invalid' );
        }
    };

    /**
     * collectionClassHandler is add or remove a class from
     * arr of node elements
     *
     * @param  {Array} node - Array of jQuery node elemet
     * @param  {String} cls - Class name
     */
    collectionClassHandler = function(node,cls){

        $.each(node,function(key,val){
            val.toggleClass(cls);
        });
    };

    settingsBtnHandler = function(e){
        var $target = $( e.target ),
        $setting = $( '#settings-' + currentTabContentId );

        $target.toggleClass( 'active' );
        $setting.toggleClass( 'hidden' );
    };

    /**
     * setIframeAndExpendButton set the src iframe and the expend button
     * with the target url value
     *
     * @param  {string} val - target url
     */
    setIframeAndExpendButton = function(val){
        $tabContentIframe.attr( 'src' , val );
        $btnExpand.attr( 'href', val );
    };

    /*================================================
    SELECT FUNCTIONS.
    ================================================*/

    /**
     * addSelectOption is creating the options for the select element
     *
     * @param  {node element} selectElement - Select node element
     * @param  {String} name - option text.
     * @param  {String} url - url from the option value.
     */
    addSelectOption = function($selectElement ,name,url){
        var $option = $( '<option></option>' );
        url = setHttp(url);
        $option.attr( 'value',url );
        $option.text( name );
        $selectElement.append( $option );
    };

    selectOptionHandler = function(e){

        e.preventDefault();
        var target = e.target;
        var optionValue = target.options[target.selectedIndex].value;
        setIframeAndExpendButton( optionValue );
    };

    /**
     * removeSelectOption remove options from the select element
     *
     * @param  {node element} selectElement - Select node element
     */
    removeSelectOption = function($selectElement){

        while ($selectElement.eq(0).children().length > 0) {
            $selectElement.eq(0).find( 'option:first' ).remove();
        }

    };

    /*================================================
    FORM FUNCTIONS.
    ================================================*/

    isUrlValid = function(str){

        var re = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        return re.test(str);

    };
    setHttp = function(url) {
            var re = /^(https?:\/\/www.)/i;

            if (re.test(url)) {

                return url.toLowerCase();
            }
            else {
                return 'http://www.' + url.toLowerCase();
            }
        };

    /*
    * formInputsHandler function check the form inputs
    *
    *  @param {collection} $inputsName - collection of all form's name inputs
    *  @param {collection} $inputsName - collection of all form's url inputs
    *  @param {element} $bookmark - form select element.
    */
    formInputsHandler = function($inputsName, $inputsUrl,$bookmark){

        var nameVal , urlVal;

        for (var i = 0; i < $inputsName.length; i++) {

            urlVal = $inputsUrl.eq(i).val();
            nameVal = $inputsName.eq(i).val();

            // checking url validation
            if(urlVal !== '' && !isUrlValid(urlVal)){
                $inputsUrl.eq(i).val('');
                urlVal = '';
            }

            // checking inputs value
            if(nameVal !== '' && urlVal === '' ){

                    $inputsUrl.eq(i).addClass( 'invalid' );
                    continue;

                }
                else if (nameVal === '' && urlVal !== '' ) {

                    $inputsName.eq(i).addClass( 'invalid' );
                    continue;

                }// if both inputs not empty
                else if(nameVal !== '' && urlVal !== ''){

                    addSelectOption($bookmark , nameVal, urlVal);

                }
                else{// both inputs are empty

                    // counting the amount of empty fieldsets
                    emptyfieldsetsCounter++;
                }

            // reset inputs with invalid class
            removeInvalidClass( $inputsName.eq(i) );
            removeInvalidClass( $inputsUrl.eq(i) );

        }// end for
    };

    formValidation = function(e){

        e.preventDefault();

        // global variables
        $tabContentIframe = $( '#content-' + currentTabContentId+' iframe' );
        $btnExpand = $('#expand-' + currentTabContentId);
        emptyfieldsetsCounter = 0;

        var $formTarget = $(e.target),
            $bookmark = $( '#bookmarks-' + currentTabContentId ).eq(0),
            $inputTypeText = $formTarget.find('input[type="text"]'),
            $inputTypeUrl = $formTarget.find('input[type="url"]'),
            // arrToBeActive: is for elements that needs to be active
            arrToBeActive = [$bookmark , $btnExpand , $tabContentIframe.parent()];


        // checking if the select has options
        if($bookmark.children().length > 0){
                removeSelectOption($bookmark,$inputTypeUrl);
        }

        // checking the inputs values and if they are valid add them to the select element
        formInputsHandler( $inputTypeText , $inputTypeUrl , $bookmark);

        // checking if the form has any invalid inputs
        if($formTarget.find('input.invalid').length>0){
                $formTarget.find('input.invalid').eq(0).focus();
                return false;
            }
            // if their is not invalid inputs then check if the all inputs are empty
            else if(emptyfieldsetsCounter === 3){

                // add hidden class to all relevet elements
                collectionClassHandler( arrToBeActive , 'hidden' );
                return false;
            }
            // form is valid
            else{

                // checking if select is hidden
                // (if true, then the expend button and iframe is hidden too)
                if($bookmark.hasClass( 'hidden' )){

                    // remove hidden class from all relevet elements
                    collectionClassHandler(arrToBeActive,'hidden');
                }

                $bookmark.focus();

                var firstOptionVal = $bookmark.children(0).attr( 'value' );

                // setting the value of the first option to the iframe and expand button
                setIframeAndExpendButton(firstOptionVal);

                // close the settings tab button
                $('#btnSettings-'+currentTabContentId).click();

                importData();
                return true;
            }
    };

    /*================================================
    STORAGE FUNCTION.
    ================================================*/
    importData = function(){
        if (Modernizr.localstorage) {

            var $tabs = $('[data-js="formTab"]'),
                    data = [];

                    console.log($tabs);

            $.each($tabs , function(index, val){
                console.log(index);
                console.log(val);
                    var $tab = $(val),
                        formHtml = $tab.html(),
                        $inputs = $tab.find('.frmSettings-input'),
                        selectedIndex = $tab.find('select')[0].selectedIndex,
                        formValues = [];


                    for (var j = 0; j < $inputs.length; j++) {

                        var input = $inputs[j];
                        console.log('$inputs[j]');
                        console.log(input);
                        console.log('$inputs[j].value');
                        console.log(input.value);
                        formValues.push(input.value);
                        console.log('formValues');
                         console.log(formValues);
                    }
                    console.log('$tab');
                    console.log($tab);
                    console.log('formHtml');
                    console.log(formHtml);
                    console.log('$inputs');
                    console.log($inputs);
                    console.log('selectedIndex');
                    console.log(selectedIndex);

                    data[val] = [formHtml, selectedIndex, formValues];
                    console.log('data[val]');
                    console.log(data[val]);
                    console.log('data');
                    console.log(data);
            });
            console.log('JSON.stringify(data)');
            console.log(JSON.stringify(data));
            localStorage.setItem('data', JSON.stringify(data));

        }
    };

    exportData = function(){
        if (Modernizr.localstorage) {
            if (localStorage.getItem('data')) {
                var $tabs = $('[data-js="formTab"]'),
                    data;

                try {
                    data = JSON.parse(localStorage.getItem('data'));
                } catch(e) {
                    console.log(e);
                    return false;
                }

                for (var i = 0; i < data.length; i++) {
                    var dataset = data[i],
                        formHtml = dataset[0],
                        index = dataset[1],
                        val = dataset[2],
                        value,
                        $tab = $tabs.eq(i),
                        $inputs,
                        $select,
                        $iframe,
                        $button;

                    $tab.html(formHtml);
                    $inputs = $tab.find('.frmSettings-input');

                    for (var j = 0; j < $inputs.length; j++) {
                        $inputs[j].value = val[j];
                    }

                    $select = $tab.find('select');
                    $select[0].selectedIndex = index;
                    if (index > -1) {
                        value = $select[0].options[$select[0].selectedIndex].value;
                        $iframe = $tab.find('iframe');
                        $iframe.attr('src', value);
                        $button = $tab.find('.to-website');
                        $button.attr('href', value);
                    }
                }
            }
        }
    };



    /*================================================
    HASH FUNCTION.
    ================================================*/

    /*
    * tabsEventHandler function is adding and removing classes
    * for activate "a" tag tabs and their relevant divs content
    *
    * tabsEventHandler is Handles 2 events:
    * 1. 'click' event
    * 2. 'hashchange' event
    */
    tabsEventHandler = function(e){

           e.preventDefault();

           var locUrl = (e.type === 'hashchange') ? e.target.location.href : e.target.href,
                targetHashIndex = locUrl.indexOf('#')+1,
                targetHashId = locUrl.slice(targetHashIndex);

           // checking if current tab is the active tab
           // yes: do nothing and return false.
           // no: continue and change the tab.
           if (targetHashId === currentTabContentId){
               return false;
           }

           // activate the target tab by id
           switchTabs(targetHashId);
    };

    init = function(){

        $(window).bind( 'hashchange' , tabsEventHandler );
        $notification.addClass( 'hidden' );

        // initialize events
        for (var i = 0; i < 4; i++) {
            if(i<2){
                $forms.eq(i).submit( formValidation );
                $btnSettingTabs.eq(i).click( settingsBtnHandler );
                $bookmarks.eq(i).change( selectOptionHandler );
            }
            $TabsCollection.eq(i).click( tabsEventHandler );
        }

        // exportData();


        // initialize tab elements
        initTabs(getActiveTab( $TabsCollection ) , getActiveTabContent( $TabsContentCollection ));

        // Display an ajax notification
        $.ajax({

            url: 'data/notification.txt',
            dataType: 'text'

        })
        .done(function (response) {
            if (response && response !== '') {
                $notification.removeClass('hidden');
                $notification.text(response);
            }
        })
        .fail(function(error){
            $notification.removeClass('hidden');
            $notification.text(error);
        });
    };


    init();
})(jQuery);

