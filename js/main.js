/* global UTILS */
window.onload = (function() {
    'use strict';
    var TabsCollection = UTILS.qsa('.tabs a'),
        TabsContentCollection = UTILS.qsa('.tab'),
        notification = UTILS.qs('.notifications'),
        bookmarks = UTILS.qsa('.bookmarks'),
        btnExpand ,tabContent , inputTypeText , inputTypeUrl,
        arrOption = [],
        storage ={
            quickReports:'',
            myFoleders:''
        };

    var forms = UTILS.qsa('.frmSettings');
    var btnSettingTabs = UTILS.qsa('.tab .btn-settings');

    var getActiveTab = function(tabs){
                    for(var i = 0; i< tabs.length ;i++){
                        if (tabs[i].classList.contains('tab-active')){
                            return tabs[i];
                        }
                    }
                };

    var getActiveTabContent = function(tabsContent){
            for (var i = 0; i < tabsContent.length; i++) {
                if(tabsContent[i].classList.contains('hidden')){
                    continue;
                }
                else{
                    return tabsContent[i];
                }
            }
        };

    var getAtagByHash = function(hash){
            for (var i = 0; i < TabsCollection.length; i++) {
                if (TabsCollection[i].hash === ('#'+hash)){
                    return TabsCollection[i];
                }
            }
        };

    var settingsBtnCheck = function(e){
        var target = e.target;
        var btnSettingsId = target.id.slice(12);
        var hasActive = UTILS.hasClass(target,'active');
        var setting = UTILS.qs('#settings-'+btnSettingsId);
        if(hasActive){
            target.classList.remove('active');
            setting.classList.add('hidden');
        }
        else {
            target.classList.add('active');
            setting.classList.remove('hidden');
        }
    };

    var addOptionToSelect = function(selectElement ,name,url){
        var option = document.createElement('OPTION');
        option.setAttribute('value',url);
        arrOption.unshift(url);
        option.innerText = name;
        selectElement.appendChild(option);
    };

    var removeChildsElements = function(myNode){
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
            arrOption.pop();
        }
    };

    var selectOptionHandler = function(e){
        e.preventDefault();
        var target = e.target;
        var currentTabContentId = currentTabContent.id.slice(4);
        var tabContent = UTILS.qs('#content-' + currentTabContentId);
        var contentIframe = tabContent.childNodes[1];
        var optionValue = target.options[target.selectedIndex].value;
        contentIframe.setAttribute('src' , optionValue);
        UTILS.qs('#expand-'+currentTabContentId).setAttribute('href', optionValue);
    };

    var isUrlValid = function(str){
        var re = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        return re.test(str);
    };

    var formValidation = function(e){
        e.preventDefault();
        var formTarget = e.target;
        inputTypeText = formTarget.querySelectorAll('input[type="text"]');
        inputTypeUrl = formTarget.querySelectorAll('input[type="url"]');
        var currentTabContentId = currentTabContent.id.slice(4);
        bookmarks = UTILS.qs('#bookmarks-'+ currentTabContentId);
        btnExpand = UTILS.qs('#expand-'+ currentTabContentId);
        tabContent = UTILS.qs('#content-' + currentTabContentId);
        var SettingButton = UTILS.qs('#btnSettings-'+currentTabContentId);
        var emptyfieldsetsCounter = 0;
        var arrToBeActive = [bookmarks,btnExpand,tabContent];

        //ben: 'arrInvalidFieldset' can be done by qs of the class invalid.
        var arrInvalidFieldset =[];
        if(bookmarks.childNodes.length > 1){
            removeChildsElements(bookmarks);
        }

        for (var i = 0; i < inputTypeText.length; i++) {

            // checking url validation
            if(inputTypeUrl[i].value !== '' && !isUrlValid(inputTypeUrl[i].value)){
                    inputTypeUrl[i].value = '';
            }

            var url = inputTypeUrl[i].value;
            var name = inputTypeText[i].value;
            if(name !== '' && url === '' ){
                UTILS.addClass(inputTypeUrl[i],'invalid');
                // adding to invalid input to arr
                arrInvalidFieldset.push(inputTypeUrl[i]);
                continue;
            }
            else if (name === '' && url !== '' ) {
                UTILS.addClass(inputTypeText[i],'invalid');
                // adding to invalid input to arr
                arrInvalidFieldset.push(inputTypeText[i]);
                continue;
            }
            else if(inputTypeText[i].value !== '' && inputTypeUrl[i].value !== ''){
                addOptionToSelect(bookmarks , inputTypeText[i].value , inputTypeUrl[i].value);
            }
            else{
                emptyfieldsetsCounter++;
            }
            if (UTILS.hasClass(inputTypeText[i] ,'invalid')){
                UTILS.removeClass(inputTypeText[i] ,'invalid');
            }
            if (UTILS.hasClass(inputTypeUrl[i] ,'invalid')){
                UTILS.removeClass(inputTypeUrl[i] ,'invalid');
            }
        }
        // checking if there is an invalid fieldset (one of the inputs is empty and the other is not)
        if(arrInvalidFieldset.length !==0){
            arrInvalidFieldset[0].focus();
            return false;
        }
        else if(emptyfieldsetsCounter === 3){
                // activeate all tab's relevant elements
                for (var j = 0; j < arrToBeActive.length; j++) {
                    UTILS.addClass(arrToBeActive[j] , 'hidden');
                }
                return false;
        }
        else{
            UTILS.emitEvent(SettingButton,'click',settingsBtnCheck);
            if(UTILS.hasClass(bookmarks , 'hidden')){
                for (var k = 0; k < arrToBeActive.length; k++) {
                    UTILS.removeClass(arrToBeActive[k] , 'hidden');
                }
            }
            bookmarks.focus();

            // when the 'bookmarks' (select) is trigger for the first time it is empty and it may holds a text node
            // type inside of it, so this 'if' condition checking if the first child is a text or element type and
            // then passing the src to the iframe.
            if(bookmarks.childNodes[0].nodeType === 1){
                tabContent.childNodes[1].setAttribute('src',bookmarks.childNodes[0].value);
                btnExpand.setAttribute('href' , bookmarks.childNodes[0].value);
            }
            else{
                tabContent.childNodes[1].setAttribute('src',bookmarks.childNodes[1].value);
                btnExpand.setAttribute('href' , bookmarks.childNodes[1].value);
            }
            return true;
        }
    };



    /*
    * checkHash function is adding and removing classes
    * for activate "a" tabs and relevant divs
    *
    * There is 2 ways that checkHash is running:
    * 1. addEventListener('click' , checkHash)
    * 2. addEventListener('hashchange' , checkHash)
    */
    var checkHash = function(e){
        // if (e.path.length !== 0 || e.newURL !== undefined){
           e.preventDefault();

           // variable "that" checking if "e" is a 'click' or 'hashchange' event
           // yes: that gets window new url.
           // no: that gets the targeted a tab element.
           var that = e.newURL ? e.newURL : e.currentTarget.href;

           var thatHashIndex = that.indexOf('#')+1;
           var hashId = that.slice(thatHashIndex);
           var targetHashIndex = currentTab.href.indexOf('#')+1;
           var targetHash = currentTab.href.slice(targetHashIndex);

           // checking if current tab is the active tab or hash is the same url + #id
           // yes: do nothing and return false.
           // no: continue and change the tab.
           if ((currentTab === that || that === currentTab.href)||(hashId === targetHash)){
               return false;
           }

           // remove class active form current tab
           currentTab.classList.remove('tab-active');
           // add class hidden to current tab content
           currentTabContent.classList.add('hidden');

           if (that.indexOf('#') !== -1) {
                var clickedHREF = that,
                clickedView = clickedHREF.split('#'),
                showTabContent = document.getElementById('tab-'+clickedView[1]),
                // aTag is the tab target
                aTag = getAtagByHash(clickedView[1]);
                location.hash = clickedView[1];
                // activate target tab
                aTag.classList.add('tab-active');
                showTabContent.classList.remove('hidden');
                currentTab = aTag; // initialize current tab
                currentTabContent = showTabContent; // initialize current tab
            }
        // }
        else{
            return false;
        }
    };

    var init = function(){
        // UTILS.addEvent(document.getElementById('btn-settings'),'click',settingsBtnCheck);
        UTILS.addEvent(window,'hashchange',checkHash);
        UTILS.addClass(notification,'hidden');
        localStorage.setItem('tabs',JSON.stringify(storage));

        for (var i = 0; i < 4; i++) {
            if(i<2){
                UTILS.addEvent(forms[i],'submit',formValidation);
                UTILS.addEvent(btnSettingTabs[i],'click',settingsBtnCheck);
                UTILS.addEvent(bookmarks[i],'change',selectOptionHandler);
            }
            UTILS.addEvent(TabsCollection[i],'click',checkHash);
        }
    };

    var currentTabContent = getActiveTabContent(TabsContentCollection),
        currentTab = getActiveTab(TabsCollection),
        currentHash = location.hash;
    init();

    /*================================================
    AJAX NOTIFICATION.
    ================================================*/

    // Display an ajax notification using UTILS.ajax.
    UTILS.ajax('../data/notification.txt', {
        done: function(response) {
            notification.classList.remove('hidden');
            notification.innerHTML = response;
        },
        fail: function(err){
            console.log(err);
        }
    });
})();

