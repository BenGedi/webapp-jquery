/* globals UTILS */

(function($) {
    'use strict';
    // functions
    var getActiveTab,getActiveTabContent,settingsBtnCheck,addSelectOption,isUrlValid,checkHash,
    resetInvalidClass,removeSelectOption,selectOptionHandler,formValidation,switchTabs,
    collectionClassHandler,init;


    // elements
    var $TabsCollection = $('.tabs li a');
    var $TabsContentCollection = $('.tab'),
        $notification = $('.notifications'),
        $bookmarks = $('.bookmarks'),
        $tabContentIframe ,$btnExpand,
        storage ={
            quickReports:'',
            myFoleders:''
        };

    var $forms = $( '.frmSettings' );
    var $btnSettingTabs = $( '.tab .btn-settings' );

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
    * urlHashId: is url with the id hash of the tab
    * that we want to be active
    */

    switchTabs = function(urlHashId){
        var $showTabContent = $('#tab-'+urlHashId),
                // aTag is the tab target
                $aTag = $('.tabs ul a[href="#'+urlHashId+'"]');

            location.hash = urlHashId;
            $aTag.addClass('tab-active');
            $showTabContent.removeClass('hidden');

            // initialize current tab (a)
            $currentTab = $aTag;
            // initialize current tab content (div)
            $currentTabContent = $showTabContent;
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
        $option.attr( 'value',url );
        $option.text( name );
        $selectElement.append( $option );
    };

    removeSelectOption = function($myNode){

        while ($myNode.eq(0).children().length > 0) {
            $myNode.eq(0).find( 'option:first' ).remove();
        }

    };

    selectOptionHandler = function(e){
        e.preventDefault();
        var target = e.target;
        var optionValue = target.options[target.selectedIndex].value;
        $tabContentIframe.attr('src' , optionValue);
        $btnExpand.attr('href', optionValue);
    };

    isUrlValid = function(str){
        var re = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        return re.test(str);
    };

    formValidation = function(e){

        e.preventDefault();
        // global variables
        $tabContentIframe = $( '#content-' + currentTabContentId+' iframe' );
        $btnExpand = $('#expand-' + currentTabContentId);

        var formTarget = e.target,
            $bookmark = $('#bookmarks-' + currentTabContentId).eq(0),
            $SettingButton = $('#btnSettings-'+currentTabContentId),
            $inputTypeText = $(formTarget.querySelectorAll( 'input[type="text"]' )),
            $inputTypeUrl = $(formTarget.querySelectorAll( 'input[type="url"]' )),
            emptyfieldsetsCounter = 0, nameVal , urlVal,
            // arrToBeActive: is for elements that needs to be active
            arrToBeActive = [$bookmark , $btnExpand , $tabContentIframe.parent()];

        if($bookmark.children().length > 0){
            removeSelectOption($bookmark,$inputTypeUrl);
        }

        for (var i = 0; i < $inputTypeText.length; i++) {

            urlVal = $inputTypeUrl.eq(i).val();
            nameVal = $inputTypeText.eq(i).val();

            // checking url validation
            if(urlVal !== '' && !isUrlValid(urlVal)){
                $inputTypeUrl.eq(i).val('');
                urlVal = '';
            }

            // checking inputs value
            if(nameVal !== '' && urlVal === '' ){

                $inputTypeUrl.eq(i).addClass( 'invalid' );
                continue;

            }else if (nameVal === '' && urlVal !== '' ) {

                $inputTypeText.eq(i).addClass( 'invalid' );
                continue;

            }else if(nameVal !== '' && urlVal !== ''){

                addSelectOption($bookmark , nameVal, urlVal);

            }else{// both inputs are empty

                emptyfieldsetsCounter++;

            }

            // reset inputs with invalid class
            resetInvalidClass($inputTypeText.eq(i));
            resetInvalidClass($inputTypeUrl.eq(i));

        }// end for

        // checking if there is any invalid inputs
        if(formTarget.querySelector('input[type="url"].invalid')){
            formTarget.querySelector('input[type="url"].invalid').focus();
            return false;
        }

        // if 'emptyfieldsetsCounter' equal to 3 then all form's inputs are empty
        else if(emptyfieldsetsCounter === 3){

                // add class hidden to all relevet elements
                // arrToBeActive: this is arr with all relavant elements
                collectionClassHandler( arrToBeActive , 'hidden' );

                // form is not valid
                return false;
        }

        // form is valid
        else{

            if($bookmark.hasClass( 'hidden' )){

                collectionClassHandler(arrToBeActive,'hidden');

            }

            $bookmark.focus();

            // insert the value of the first option to the iframe and expand button
            var firstOptionVal = $bookmark.children(0).attr('value');

            $tabContentIframe[0].setAttribute('src', firstOptionVal);
            $btnExpand[0].setAttribute('href' , firstOptionVal);
            $SettingButton.click();
            return true;
        }
    };


    /*================================================
    HASH FUNCTION.
    ================================================*/

    /*
    * checkHash function is adding and removing classes
    * for activate "a" tabs and relevant divs
    *
    * There is 2 ways that checkHash is running:
    * 1. addEventListener('click' , checkHash)
    * 2. addEventListener('hashchange' , checkHash)
    */
    checkHash = function(e){
           e.preventDefault();
           var locUrl = (e.type === 'hashchange') ? e.target.location.href : e.target.href,
                targetHashIndex = locUrl.indexOf('#')+1,
                targetHashId = locUrl.slice(targetHashIndex),
                currentHashIndex = $currentTab.attr('href').indexOf('#')+1,
                currentHash = $currentTab.attr('href').slice(currentHashIndex);

           // checking if current tab is the active tab
           // yes: do nothing and return false.
           // no: continue and change the tab.
           if (targetHashId === currentHash){
               return false;
           }

           // remove class active form current tab
           $currentTab.removeClass('tab-active');
           // add class hidden to current tab content
           $currentTabContent.addClass('hidden');

           // activate the target tab
           switchTabs(targetHashId);
    };

    init = function(){

        $(window).bind('hashchange',checkHash);
        $notification.addClass('hidden');
        localStorage.setItem('tabs',JSON.stringify(storage));

        for (var i = 0; i < 4; i++) {
            if(i<2){
                $forms.eq(i).submit(formValidation);
                $btnSettingTabs.eq(i).click(settingsBtnCheck);
                $bookmarks.eq(i).change(selectOptionHandler);
            }
            $TabsCollection.eq(i).click(checkHash);
        }
    };

    // initialize tab elements
    var $currentTabContent = getActiveTabContent($TabsContentCollection),
        $currentTab = getActiveTab($TabsCollection),
        currentTabContentId = $currentTabContent[0].id.slice(4);

    init();

    /*================================================
    AJAX NOTIFICATION.
    ================================================*/

    // Display an ajax notification using UTILS.ajax.
    UTILS.ajax('../data/notification.txt', {
        done: function(response) {
            $notification.removeClass('hidden');
            $notification.html(response);
        },
        fail: function(err){
            console.log(err);
        }
    });
})(jQuery);

