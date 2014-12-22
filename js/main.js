
(function($) {
    'use strict';
    // functions
    var getActiveTab,getActiveTabContent,settingsBtnCheck,addSelectOption,setHttp,isUrlValid,tabsHandler,
    resetInvalidClass,removeSelectOption,selectOptionHandler,formValidation,switchTabs,
    collectionClassHandler,setIframeAndExpendButton,formInputsHandler,init;


    // elements
    var $TabsCollection = $('.tabs li a'),
        $TabsContentCollection = $('.tab'),
        $notification = $('.notifications'),
        $bookmarks = $('.bookmarks'),
        $tabContentIframe ,$btnExpand,
        $forms = $( '.frmSettings' ),
        $btnSettingTabs = $( '.tab .btn-settings' );

    var emptyfieldsetsCounter,
        storage ={
            quickReports:'',
            myFoleders:''
        };


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
    * switchTabs function is activate the tabs
    *
    *  @param {string} urlHashId - id from the target hash
    */
    switchTabs = function(urlHashId){
        var $targtTabContent = $( '#tab-' + urlHashId ),
                // aTag is the tab target
                $aTag = $( '.tabs ul a[href="#'+urlHashId+'"]' );

            location.hash = urlHashId;
            $aTag.addClass('tab-active');
            $targtTabContent.removeClass('hidden');

            // initialize current tab (a)
            $currentTab = $aTag;
            // initialize current tab content (div)
            $currentTabContent = $targtTabContent;
            // initialize current tab content id
            currentTabContentId = urlHashId;
    };

    /*================================================
    HELPER FUNCTIONS.
    ================================================*/

    resetInvalidClass = function($node){
        if ($node.hasClass( 'invalid' )){
            $node.removeClass( 'invalid' );
        }
    };

    collectionClassHandler = function(node,cls){
        for (var j = 0; j < node.length; j++) {
            node[j].toggleClass(cls);
        }
    };

    /*================================================
    FORM FUNCTIONS.
    ================================================*/

    settingsBtnCheck = function(e){
        var $target = $( e.target ),
        $setting = $( '#settings-' + currentTabContentId );
        $target.toggleClass( 'active' );
        $setting.toggleClass( 'hidden' );
    };

    addSelectOption = function($selectElement ,name,url){
        var $option = $( '<option></option>' );
        url = setHttp(url);
        $option.attr( 'value',url );
        $option.text( name );
        $selectElement.append( $option );
    };

    removeSelectOption = function($myNode){

        while ($myNode.eq(0).children().length > 0) {
            $myNode.eq(0).find( 'option:first' ).remove();
        }

    };

    setIframeAndExpendButton = function(val){
        $tabContentIframe.attr( 'src' , val );
        $btnExpand.attr( 'href', val );
    };

    selectOptionHandler = function(e){

        e.preventDefault();
        var target = e.target;
        var optionValue = target.options[target.selectedIndex].value;

        setIframeAndExpendButton( optionValue );
    };

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
    *  @param {element} $bookmark - the form select element.
    */
    formInputsHandler = function($inputsName, $inputsUrl,$bookmark){

        var nameVal , urlVal;

        // loop going over the inputs
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

                    emptyfieldsetsCounter++;
                }

            // reset inputs with invalid class
            resetInvalidClass( $inputsName.eq(i) );
            resetInvalidClass( $inputsUrl.eq(i) );

        }// end for
    };

    formValidation = function(e){

        e.preventDefault();

        // global variables
        $tabContentIframe = $( '#content-' + currentTabContentId+' iframe' );
        $btnExpand = $('#expand-' + currentTabContentId);
        emptyfieldsetsCounter = 0;

        var formTarget = e.target,
            $bookmark = $( '#bookmarks-' + currentTabContentId ).eq(0),
            $SettingButton = $( '#btnSettings-'+currentTabContentId ),
            $inputTypeText = $( formTarget.querySelectorAll( 'input[type="text"]' ) ),
            $inputTypeUrl = $( formTarget.querySelectorAll( 'input[type="url"]' ) ),
            // arrToBeActive: is for elements that needs to be active
            arrToBeActive = [$bookmark , $btnExpand , $tabContentIframe.parent()];

        // checking if the select has options
        if($bookmark.children().length > 0){
            removeSelectOption($bookmark,$inputTypeUrl);
        }

        // checking the inputs values and if they are valid add them to the select option
        formInputsHandler( $inputTypeText , $inputTypeUrl , $bookmark);

        // checking if there is any invalid inputs
        if(formTarget.querySelector( 'input[type="url"].invalid' )){
            formTarget.querySelector( 'input[type="url"].invalid' ).focus();
            return false;
        }
        // if their is not invalid inputs then check if the all inputs are empty
        else if(emptyfieldsetsCounter === 3){

                // add hidden class to all relevet elements
                collectionClassHandler( arrToBeActive , 'hidden' );

                // form is not valid
                return false;
        }
        // form is valid
        else{

            if($bookmark.hasClass( 'hidden' )){

                // remove hidden class from all relevet elements
                collectionClassHandler(arrToBeActive,'hidden');

            }

            $bookmark.focus();

            // insert the value of the first option to the iframe and expand button
            var firstOptionVal = $bookmark.children(0).attr( 'value' );

            setIframeAndExpendButton(firstOptionVal);
            $SettingButton.click();
            return true;
        }
    };


    /*================================================
    HASH FUNCTION.
    ================================================*/

    /*
    * tabsHandler function is adding and removing classes
    * for activate "a" tag tabs and their relevant divs
    *
    * tabsHandler is running on 2 events:
    * 1. 'click' event
    * 2. 'hashchange' event
    */
    tabsHandler = function(e){

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

           // remove class active form current tab
           $currentTab.removeClass( 'tab-active');
           // add class hidden to current tab content
           $currentTabContent.addClass( 'hidden' );

           // activate the target tab by id
           switchTabs(targetHashId);
    };

    init = function(){

        $(window).bind( 'hashchange' , tabsHandler );
        $notification.addClass( 'hidden' );
        localStorage.setItem( 'tabs' , JSON.stringify(storage) );

        // initialize events
        for (var i = 0; i < 4; i++) {
            if(i<2){
                $forms.eq(i).submit( formValidation );
                $btnSettingTabs.eq(i).click( settingsBtnCheck );
                $bookmarks.eq(i).change( selectOptionHandler );
            }
            $TabsCollection.eq(i).click( tabsHandler );
        }
        // initialize ajax
        $.ajax({

            url: '../data/notification.txt',
            dataType: 'text'

        })
        .done(function (response) {
            console.log(response);
            var $message = $('.notifications').eq(0);
            if (response && response !== '') {
                console.log('in the ajax if');
                $message.removeClass('hidden');
                $message.text(response);
                console.log($message);
            }
        });
    };

    // initialize tab elements
    var $currentTabContent = getActiveTabContent( $TabsContentCollection ),
        $currentTab = getActiveTab( $TabsCollection ),
        currentTabContentId = $currentTabContent[0].id.slice(4);

    init();

    /*================================================
    AJAX NOTIFICATION.
    ================================================*/

    // Display an ajax notification using UTILS.ajax.
    // UTILS.ajax('../data/notification.txt', {
    //     done: function(response) {
    //         $notification.removeClass('hidden');
    //         $notification.html(response);
    //     },
    //     fail: function(err){
    //         console.log(err);
    //     }
    // });
})(jQuery);

