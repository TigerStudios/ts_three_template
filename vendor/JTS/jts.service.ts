
JTS.prototype = Object.create(Array.prototype);
JTS.prototype.constructor = JTS;

export function JTS(selector: any){

    if (typeof selector === 'function') {

        setDocumentReady(selector);
        return null;

    }

    const set = init(selector);

    return new JTS.ts(set , selector);

    function init(innerSelector: any) {

        const innerSet = [];

        if (!innerSelector) {

            /*Don' t do anything*/

        }
        else {

            parseSelector(innerSelector);

        }

        function parseSelector(sel: any) {

            const constructor = String(sel.constructor);

            if (sel === window) {

                innerSet.push(window);

            }
            else if (sel === document) {

                innerSet.push(document);

            }
            else if (constructor.match(/NodeList/) || constructor.match(/HTMLCollection/)) {

                for (const element of sel) {

                    if (element.nodeType !== 3) {

                        innerSet.push(element);

                    }

                }

            }
            else if (constructor.match(/HTML[a-zA-z]+Element/) || constructor.match(/SVG[a-zA-z]+Element/) || constructor.match(/HTMLElement/)) {

                innerSet.push(sel);

            }
            else if (constructor.match(/Array/)) {

                parseSelectorArray(sel);

            }
            else if (constructor.match(/String/)) {

                parseStringSelector(sel);

            }
            else if (constructor.match(/Number/)) {

                parseStringSelector(String(sel));

            }
            else if (constructor.match(/\/\*JTS constructor fingerprint\*\//)){

                sel.each((i , e) => innerSet.push(e));

            }
            else {

                console.log(`JTS@init : Can not parse ${sel} selector`);

            }

        }

        function parseSelectorArray(sel: Array<any>) {

            for (const object of sel) {

                parseSelector(object);

            }

        }

        function parseStringSelector(sel: string) {

            if (sel.match(/^</)) {

                createElement(sel);

            }
            else {

                try {

                    const element = document.querySelectorAll(sel);

                    if (element && element.length !== 0) {

                        parseSelector(element);

                    }

                }
                catch (e) {

                    // do nothing

                }

            }

        }

        function createElement(sel: string) {

            let canvas = document.createElement('div');

            if (sel.match(/^<thead/) || sel.match(/^<tbody/) || sel.match(/^<tfoot/)) {

                canvas = document.createElement('table');

            }
            else if (sel.match(/^<tr/)) {

                canvas = document.createElement('tbody');

            }
            else if (sel.match(/^<td/) || sel.match(/^<th/)) {

                canvas = document.createElement('tr');

            }

            canvas.innerHTML = sel;

            pushElement(0);

            function pushElement(index: number) {

                if (index < canvas.childNodes.length){

                    innerSet.push(canvas.childNodes[index]);
                    pushElement(index + 1);

                }

            }

        }

        return innerSet;

    }

    function setDocumentReady(f: () => void) {

        if (window.addEventListener) {

            window.addEventListener('load', f, false);

        }

    }

}

JTS.prototype.active = function(value?: boolean){

    const t = this;

    if (arguments.length === 1){

        t.attr('active', value);

        return t;

    }else{

        return t.attr('active');

    }

};

JTS.prototype.addClass = function(classToAdd: string) {

    const t = this;

    const classArray = classToAdd.trim().split(' ');

    t.each(addValue);

    function addValue(i, e) {

        let oldClass = e.getAttribute('class');
        let oldClassArray = [];

        if (oldClass){

            oldClass = oldClass.trim();
            oldClassArray = oldClass.split(' ');

        }

        for (let l = 0; l < classArray.length; l++){

            if (oldClassArray.indexOf(classArray[l]) !== -1){

                classArray.splice(l, 1);
                l--;

            }

        }

        const parsedClass = (oldClass ? oldClass + ' ' : '') + classArray.join(' ');

        e.setAttribute('class', parsedClass);

    }

    return this;

};

JTS.prototype.addClassRecursive = function(classToAdd: string) {

    const t = this;

    t.each(addValue);

    function addValue(i, e) {

        const NODE_TYPE = 1;

        if (e.nodeType === NODE_TYPE) {

            JTS(e).addClass(classToAdd);

            const children = JTS(e.childNodes);

            children.addClassRecursive(classToAdd);

        }

    }

    return this;

};

JTS.prototype.append = function(content: any, after?: any) {

    const t = this;

    let jTSObject = [];
    const constructor = String(content.constructor);

    if (constructor.match(/\/\*JTS constructor fingerprint\*\//)) {

        jTSObject = content;

    }
    else {

        jTSObject = JTS(content);

    }

    if (jTSObject.length === 0 && constructor.match(/String/)) {

        jTSObject = [];
        parseChildNodes(content);

    }

    if (jTSObject.length === 0 && constructor.match(/Number/)) {

        jTSObject = [];
        parseChildNodes(content.toString());

    }

    if (constructor.match(/Array/)) {

        jTSObject = [];

        for (const object of content) {

            const currentObject = JTS(object);

            if (currentObject.length === 0 && (typeof object === 'string' || typeof object === 'number')) {

                parseChildNodes(object.toString());

            }
            else if (currentObject.length > 0) {

                currentObject.each( (i, e) => jTSObject.push(e));

            }

        }

    }

    function parseChildNodes(val) {

        const canvas = document.createElement('div');

        canvas.innerHTML = val;

        pushElement(0);

        function pushElement(index) {

            if (index < (canvas.childNodes).length){

                jTSObject.push(canvas.childNodes[index]);
                pushElement(index + 1);

            }

        }

    }

    t.each(addList);

    function addList(index, e) {

        let target = null;
        let children = null;
        let flag = false;

        if (after) {

            target = JTS(after);

            if (target.length > 0) {

                children = e.childNodes;

            }

        }

        if (children) {

            for (const child of children) {
                if (flag){
                    break;
                }
                for (const currentTarget of target) {

                    if (child === currentTarget) {

                        flag = true;
                        target = child;
                        break;

                    }

                }
            }

        }

        if (flag) {

            for (const object of jTSObject) {

                let clone = null;

                if (index === 0) {

                    clone = object;

                }
                else {

                    clone = object.cloneNode(true);

                }

                if (object.nodeType !== 3) {

                    target.insertAdjacentElement('afterend', clone);

                }
                else {

                    target.insertAdjacentText('afterend', clone.textContent);

                }

                target = clone;

            }

        }
        else {

            for (const  object of jTSObject) {

                let clone = null;

                if (index === 0) {

                    clone = object;

                }
                else {

                    clone = object.cloneNode(true);

                }

                e.appendChild(clone);

            }

        }

    }

    return this;

};

JTS.prototype.appendOut = function(content: any) {

    const t = this;

    let jTSObject = [];
    const constructor = String(content.constructor);

    if (constructor.match(/\/\*JTS constructor fingerprint\*\//)) {

        jTSObject = content;

    }
    else {

        jTSObject = JTS(content);

    }

    if (jTSObject.length === 0 && constructor.match(/String/)) {

        jTSObject = [];
        parseChildNodes(content);

    }

    if (jTSObject.length === 0 && constructor.match(/Number/)) {

        jTSObject = [];
        parseChildNodes(content.toString());

    }

    if (constructor.match(/Array/)) {

        jTSObject = [];

        for (const parsedContent of content) {

            const currentObject = JTS(parsedContent);

            if (currentObject.length === 0 && (typeof parsedContent === 'string' || typeof parsedContent === 'number')) {

                parseChildNodes(parsedContent.toString());

            }
            else if (currentObject.length > 0) {

                currentObject.each( (i, e) => jTSObject.push(e) );

            }

        }

    }

    function parseChildNodes(val) {

        const canvas = document.createElement('div');

        canvas.innerHTML = val;

        pushElement(0);

        function pushElement(index) {
            if (index < canvas.childNodes.length){
                jTSObject.push(canvas.childNodes[index]);
                pushElement(index + 1);
            }
        }
    }

    t.each(addList);

    function addList(index, e) {

        let target = e;

        for (const object of jTSObject) {

            let clone = null;

            if (index === 0) {

                clone = object;

            }
            else {

                clone = object.cloneNode(true);

            }

            if (object.nodeType !== 3) {

                target.insertAdjacentElement('afterend', clone);

            }
            else {

                target.insertAdjacentText('afterend', clone.textContent);

            }

            target = clone;

        }

    }

    return this;

};

JTS.prototype.attr = function(attributes: any , value?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (arguments.length === 1 && typeof arguments[0] === 'string') {

        return getAttribute(attributes);

    }
    else if (arguments.length === 1 && typeof arguments[0] === 'object') {

        setAttributes(attributes);

    }
    else if (arguments.length === 2 && typeof arguments[0] === 'string') {

        const currentObject = {};

        currentObject[attributes] = value;
        setAttributes(currentObject);

    }
    else {

        console.log('JTS@attr : incorrect arguments list');

    }

    function getAttribute(a) {

        for (const n of JTS.boolean.value_attribute) {

            if (n === a) {

                if (t[0].getAttribute(a) || t[0].attributes[a]){

                    return true;

                }

                return t[0][a];

            }

        }

        return t[0].getAttribute(a);

    }

    function setAttributes(a) {

        t.each( (i, e) => {

            for (const attributeName in a) {

                if (a.hasOwnProperty(attributeName)){

                    let flag = false;
                    const attribute = e.getAttributeNode(attributeName) || document.createAttribute(attributeName);

                    for (const n of JTS.boolean.value_attribute) {

                        if (n === attributeName) {

                            e[attributeName] = Boolean(a[attributeName]);
                            flag = true;

                            if (Boolean(a[attributeName])) {

                                if (!e.getAttributeNode(attributeName)) {

                                    e.setAttributeNode(attribute);

                                }

                            }
                            else {

                                if (e.getAttributeNode(attributeName)) {

                                    e.attributes.removeNamedItem(attributeName);

                                }

                            }

                            break;

                        }

                    }

                    if (!flag) {

                        attribute.value = a[attributeName];

                        if (JTS.jBrowser() === 'IE' && attributeName.toLocaleLowerCase() === 'type') {

                            /*this only for IE bug*/
                            e.setAttribute('type', a[attributeName]);

                        }
                        else {

                            e.setAttributeNode(attribute);

                        }

                    }

                }

            }

        });

    }

    return this;

};

JTS.prototype.before = function(content: any, previousTo?: any) {

    const t = this;

    let jTSObject = [];
    const constructor = String(content.constructor);

    if (constructor.match(/\/\*JTS constructor fingerprint\*\//)) {

        jTSObject = content;

    }
    else {

        jTSObject = JTS(content);

    }

    if (jTSObject.length === 0 && constructor.match(/String/)) {

        jTSObject = [];
        parseChildNodes(content);

    }

    if (jTSObject.length === 0 && constructor.match(/Number/)) {

        jTSObject = [];
        parseChildNodes(content.toString());

    }

    if (constructor.match(/Array/)) {

        jTSObject = [];

        for (const object of content) {

            const currentObject = JTS(object);

            if (currentObject.length === 0 && (typeof object === 'string' || typeof object === 'number')) {

                parseChildNodes(object.toString());

            }
            else if (currentObject.length > 0) {

                currentObject.each( (i, e) => jTSObject.push(e) );

            }

        }

    }

    function parseChildNodes(val) {

        const canvas = document.createElement('div');

        canvas.innerHTML = val;

        pushElement(0);

        function  pushElement(index) {

            if (index < canvas.childNodes.length){
                jTSObject.push(canvas.childNodes[index]);
                pushElement(index + 1);
            }

        }
    }

    t.each(addList);

    function addList(index, e) {

        let target = null;
        let children = null;
        let flag = false;

        if (previousTo) {

            target = JTS(previousTo);

            if (target.length > 0) {

                children = e.childNodes;

            }

        }

        if (children) {

            for (const child of children) {

                if (flag){

                    break;

                }

                for (const parsedTarget of target) {

                    if (child === parsedTarget) {

                        target = child;
                        flag = true;
                        break;

                    }

                }

            }

        }

        if (!flag) {

            target = e.childNodes[0];

        }

        if (target) {

            for (const object of jTSObject) {

                let clone = null;

                if (index === 0) {

                    clone = object;

                }
                else {

                    clone = object.cloneNode(true);

                }

                e.insertBefore(clone, target);

            }

        }
        else {

            for (const object of jTSObject) {

                let clone = null;

                if (index === 0) {

                    clone = object;

                }
                else {

                    clone = object.cloneNode(true);

                }

                e.appendChild(clone);

            }

        }

    }

    return this;

};

JTS.prototype.beforeOut = function(content: any) {

    const t = this;

    let jTSObject = [];
    const constructor = String(content.constructor);

    if (constructor.match(/\/\*JTS constructor fingerprint\*\//)) {

        jTSObject = content;

    }
    else {

        jTSObject = JTS(content);

    }

    if (jTSObject.length === 0 && constructor.match(/String/)) {

        jTSObject = [];
        parseChildNodes(content);

    }

    if (jTSObject.length === 0 && constructor.match(/Number/)) {

        jTSObject = [];
        parseChildNodes(content.toString());

    }

    if (constructor.match(/Array/)) {

        jTSObject = [];

        for (const item of content) {

            const currentObject = JTS(item);

            if (currentObject.length === 0 && (typeof item === 'string' || typeof item === 'number' )) {

                parseChildNodes(item.toString());

            }
            else if (currentObject.length > 0) {

                currentObject.each( (i, e) => jTSObject.push(e) );

            }

        }

    }

    function parseChildNodes(val) {

        const canvas = document.createElement('div');

        canvas.innerHTML = val;

        pushElement(0);

        function pushElement(index) {
            if (index < canvas.childNodes.length){
                jTSObject.push(canvas.childNodes[index]);
                pushElement(index + 1);
            }
        }
    }

    t.each(addList);

    function addList(index, e) {

        for (const object of jTSObject) {

            let clone = null;

            if (index === 0) {

                clone = object;

            }
            else {

                clone = object.cloneNode(true);

            }

            JTS(e).offsetPs()[0].insertBefore(clone, e);

        }

    }

    return this;

};

JTS.prototype.bind = function(eventType: string, callback , data?: any) {

    const t = this;

    const typeNamespaceArray = eventType.split('.');
    const eventsList =         typeNamespaceArray[0].split(' ');
    const namespace =          typeNamespaceArray.length > 1 ? typeNamespaceArray[1] : 'none';

    for (const eventName of eventsList) {

        if (!JTS.flow.events[eventName]) {

            let config: any = false;

            if (eventName.match('touch') || eventType.match('mousewheel') || eventType.match('DOMMouseScroll') || eventType.match('MozMousePixelScroll')) {

                config = { passive : false };

            }

            window.addEventListener(eventName, callerF, config);

            JTS.flow.events[eventName] = true;

        }

        if (!JTS.flow.listeners[`${eventName}-${namespace}`]) {
            JTS.flow.stackIndex[`${eventName}-${namespace}`] = 0;
            JTS.flow.listeners[`${eventName}-${namespace}`] = [];
        }

    }

    function callerF(e) {

        let setName = [];

        for (const n in JTS.flow.listeners) {

            if (JTS.flow.listeners.hasOwnProperty(n)){

                if (String(n).split('-')[0].match(e.type)) {

                    setName.push(String(n));

                }

            }

        }

        e.immediatePropS =     false;
        e.propagationStopped = false;
        e.propagationSO =      null;

        let target = e.target;

        if (target !== window && target !== document) {

            while (target) {

                triggerListener(target);
                target = JTS(target).offsetPs()[0];

            }

        }

        target = document;
        triggerListener(target);

        target = window;
        triggerListener(target);

        function triggerListener(inspectedTarget) {

            for (let i = 0; i < setName.length; i++) {

                JTS.flow.stackIndex[setName[i]] = 0;

                findListener(JTS.flow.stackIndex[setName[i]] , i);

                setName = [];

                for (const n in JTS.flow.listeners) {

                    if (JTS.flow.listeners.hasOwnProperty(n)){

                        if (String(n).split('-')[0].match(e.type)) {

                            setName.push(String(n));

                        }

                    }

                }

            }

            function findListener(index , forIndex) {

                if (index < JTS.flow.listeners[setName[forIndex]].length) {

                    const l = JTS.flow.listeners[setName[forIndex]][index];

                    if (inspectedTarget === l.element && l.type.match(e.type) && (!l.executed)) {

                        if (!e.immediatePropS) {

                            let flag = true;

                            if (e.propagationStopped && e.propagationSO !== l.element) {

                                flag = false;

                            }

                            if (flag) {

                                const jTSEvent = new JTS.flow.Event(e , l , data);

                                l.executed = true;
                                l.callback.call(l.element, jTSEvent);

                            }

                        }

                    }

                    JTS.flow.stackIndex[setName[forIndex]] += 1;

                    if (JTS.flow.stackIndex[setName[forIndex]] < 0) {

                        JTS.flow.stackIndex[setName[forIndex]] = 0;

                    }

                    findListener(JTS.flow.stackIndex[setName[forIndex]] , forIndex);

                }
                else {

                    for (const listener of JTS.flow.listeners[setName[forIndex]]) {

                        listener.executed = false;

                    }

                }

            }

        }

        JTS.flow.clearFlow();

    }

    t.each(addListener);

    function addListener(index, element) {

        for (const eventName of eventsList) {

            const listener = {

                type: eventName,
                element,
                index,
                callback,
                namespace,
                executed : false

            };

            JTS.flow.listeners[`${eventName}-${namespace}`].push(listener);

        }

    }

    return this;

};

JTS.prototype.centerImage = function() {

    const t = this;

    t.each(setPositionAndSize);

    function setPositionAndSize(i, e) {

        const tag = e.tagName.toLowerCase();

        if (!(tag === 'img' || tag === 'div')) {

            return;

        }

        let image = null;
        let flag =  false;

        if (tag === 'img') {

            image = e;
            flag =  true;

        }
        else {

            const nodes = e.children;

            for (const currentNode of nodes) {

                if (currentNode.nodeType === 1 && currentNode.tagName.toLowerCase() === 'img') {

                    image = currentNode;
                    flag =  true;

                    break;

                }

            }

        }

        if (!flag) {

            return;

        }

        JTS(image).css('position', 'absolute');

        let imageOriginalWidth =  0;
        let imageOriginalHeight = 0;

        const imgLoader: any = new Image();

        imgLoader.onload = () => {

            imageOriginalWidth =  imgLoader.naturalWidth  || imgLoader.originalWidth;
            imageOriginalHeight = imgLoader.naturalHeight || imgLoader.originalHeight;

            query();

        };

        let parent = JTS(image).offsetPs()[0];

        if (parent === document.querySelector('body')) {

            parent = window;

        }

        const parentWidth =  JTS(parent).outerWidth();
        const parentHeight = JTS(parent).outerHeight();

        imgLoader.src = image.src;

        function query() {

            JTS(image).css(getValues(parentWidth, parentHeight));

        }

        function getValues(parentW, parentH) {

            let imageWidth = 0;
            let imageHeight = 0;
            let imageLeft;
            let imageTop ;

            if (parentW >= parentH) {

                parseHeight(parentW);

            }
            else {


                parseWidth(parentH);

            }

            imageLeft = (parentW * 0.5) - (imageWidth * 0.5);
            imageTop = (parentH * 0.5) - (imageHeight * 0.5);

            function parseHeight(width) {

                imageWidth = width;
                imageHeight = imageOriginalHeight * (width / imageOriginalWidth);

                if (imageHeight < parentH) {

                    parseHeight(width + 1);

                }

            }

            function parseWidth(height) {

                imageHeight = height;
                imageWidth = imageOriginalWidth * (height / imageOriginalHeight);

                if (imageWidth < parentW) {

                    parseWidth(height + 1);

                }

            }

            return { width : imageWidth, height : imageHeight, left : imageLeft, top : imageTop };

        }

    }

    return t;

};

JTS.prototype.click = function(namespace , handler? , data?){

    const t = this;

    let clickNamespace;
    let clickHandler;
    let clickData;

    if ((typeof arguments[0]).toLowerCase() === 'string'){

        clickNamespace = '.' + namespace;
        clickHandler = handler;

        if (arguments.length === 3){

            clickData = data;

        }

    }else if ((typeof arguments[0]).toLowerCase() === 'function'){

        clickNamespace = '';
        clickHandler = arguments[0];

        if (arguments.length === 2){

            clickData = arguments[1];

        }

    }

    t.bind(`click${clickNamespace}`, clickHandler, clickData);

    return t;

};

JTS.prototype.clone = function() {

    const t = this;

    const e = [];

    t.each(pushE);

    function pushE(index, element) {

        const clone = element.cloneNode(true);

        e.push(clone);

    }

    return JTS(e);

};

JTS.prototype.colorPicker = function(configuration) {

    const t = this;

    const SATURATION_BRIGHTNESS_SIZE = 130;
    const HUE_CONTAINER_HEIGHT = 130;
    const HUE_RANGE = 360;
    const DARK_STYLE = 0;
    const LIGHT_STYLE = 1;
    const DEEP_DARK_STYLE = 2;

    const backgroundColor =  ['#333333', '#cecdcd', '#111111'];
    const hueSelectorImage = ['huesdark.png', 'hueslight.png', 'huesdark.png'];
    const valueNameBG =      ['#262323', '#f3f3f3', '#333333'];
    const valueValueBG =     ['#ffffff', '#333333', '#ffffff'];
    const textColor =        ['#6ba9d7', '#000000', '#f50069'];
    const valueColor =       ['#000000', '#ffffff', '#000000'];
    let style =            DARK_STYLE;

    switch (configuration.style) {

        case 'dark':
        case 'dark-round':
            style = DARK_STYLE;
            break;
        case 'light':
        case 'light-round':
            style = LIGHT_STYLE;
            break;
        case 'deep-dark':
        case 'deep-dark-round':
            style = DEEP_DARK_STYLE;
            break;

    }

    t.each(setPicker);

    function setPicker(index, element) {

        JTS(element).css('cursor', 'pointer');

        let container;
        let startRGBColor;
        let startHSBColor;

        let pickerOut = false;
        const parsedID = '' + new Date().getTime() + index;

        JTS(element).bind('click.jts_picker_events_' + parsedID, (e) => {

            if (!pickerOut) {

                pickerOut = true;

                startRGBColor = parseRGBColor(element);
                startHSBColor = rGBtoHSB(startRGBColor);

                addInterface(e);

            }

        });

        function addInterface(e) {

            container = document.createElement('div');

            const css = {

                position: 'absolute',
                'box-shadow': '0px 2px 2px 0px rgba(0,0,0,0.3)',
                top: e.screenY + (window.pageYOffset || document.documentElement.scrollTop),
                left: e.screenX,
                'z-index': 500,
                width: 300,
                height: 210,
                'background-color': backgroundColor[style],
                'border-radius': (configuration.style).match('round') ? 10 : 0

            };

            JTS(container).attr('id', 'jts_picker_container_' + parsedID).css(css);
            JTS(container).load(configuration.path + 'color_picker/picker_html.html', initPicker);

        }

        function initPicker() {

            JTS('body').append(container);

            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_value , #jts_picker_container_' + parsedID + ' .jts_picker_selector')
                .each( (i, e) => {

                JTS(e).attr('id', JTS(e).attr('id') + '_' + parsedID);

            });

            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_shade_image')
                .attr('src', configuration.path + 'color_picker/shade.png');
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_sbs_image')
                .attr('src', configuration.path + 'color_picker/sbselector.png');
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_hue_image')
                .attr('src', configuration.path + 'color_picker/hue.png');
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_hues_image')
                .attr('src', configuration.path + 'color_picker/' + hueSelectorImage[style]);
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_name_rgb')
                .css({ 'background-color': valueNameBG[style], color: textColor[style] });
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_value')
                .css({ 'background-color': valueValueBG[style], color: valueColor[style] });
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_compare_container div')
                .css('color', textColor[style]);
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_submit')
                .css({ 'background-color': valueNameBG[style], color: textColor[style] });

            const rgbColor = 'rgb(' + startRGBColor[0] + ',' + startRGBColor[1] + ',' + startRGBColor[2] + ')';

            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_table').css('background-color', 'hsl(' + startHSBColor[0] + ', 100% , 50%)');
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_current_color').css('background-color', rgbColor);
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_next_color').css('background-color', rgbColor);

            JTS('#jts_red_val_' + parsedID).html(String(startRGBColor[0]));
            JTS('#jts_green_val_' + parsedID).html(String(startRGBColor[1]));
            JTS('#jts_blue_val_' + parsedID).html(String(startRGBColor[2]));
            JTS('#jts_exadecimal_val_' + parsedID).html(String(rGBtoEXADECIMAL(startRGBColor)));

            const sbX = SATURATION_BRIGHTNESS_SIZE * (startHSBColor[1] / 100);
            let sbY = SATURATION_BRIGHTNESS_SIZE * (startHSBColor[2] / 100);
            sbY = SATURATION_BRIGHTNESS_SIZE + (-sbY);

            let hueY = startHSBColor[0] * (HUE_CONTAINER_HEIGHT / HUE_RANGE);
            hueY = HUE_CONTAINER_HEIGHT + (-hueY);

            JTS('#jts_sb_selector_' + parsedID).css({ left: sbX, top: sbY });
            JTS('#jts_hue_selector_' + parsedID).css('top', hueY);

            setPickerListeners();

        }

        function setPickerListeners() {

            const mobile = JTS.jMobile();
            const mousedown = mobile ? 'touchstart' : 'mousedown';
            const mousemove = mobile ? 'touchmove' : 'mousemove';
            const mouseup = mobile ? 'touchend' : 'mouseup';

            let currentX;
            let currentY;
            let previousX;
            let previousY;
            let vX;
            let vY;

            JTS(container).bind(mousedown + '.jts_picker_event_' + parsedID,  (e) => {

                e.preventDefault();

                if (e.target.getAttribute('id') === 'jts_picker_container_' + parsedID) {

                    currentX = mobile ? e.touches[0].clientX : e.screenX;
                    currentY = mobile ? e.touches[0].clientY : e.screenY;
                    previousX = mobile ? e.touches[0].clientX : e.screenX;
                    previousY = mobile ? e.touches[0].clientY : e.screenY;

                    JTS(window).bind(mousemove + '.jts_picker_event_' + parsedID, (eW) => {

                        eW.preventDefault();

                        currentX = mobile ? eW.touches[0].clientX : eW.screenX;
                        currentY = mobile ? eW.touches[0].clientY : eW.screenY;

                        vX = currentX - previousX;
                        vY = currentY - previousY;

                        previousX = currentX;
                        previousY = currentY;


                        const target: any = document.querySelector('#jts_picker_container_' + parsedID);

                        let x = target.offsetLeft;
                        let y = target.offsetTop;

                        x += vX;
                        y += vY;

                        target.style.left = x + 'px';
                        target.style.top = y + 'px';


                    });
                    JTS(window).bind(mouseup + '.jts_picker_event_' + parsedID,  (eW) =>  {

                        JTS(window).unbind('.jts_picker_event_' + parsedID);

                    });

                }

            });

            JTS('#jts_sb_selector_' + parsedID).bind(mousedown + '.jts_picker_event_' + parsedID,  (e) => {

                e.preventDefault();

                currentX = mobile ? e.touches[0].clientX : e.screenX;
                currentY = mobile ? e.touches[0].clientY : e.screenY;
                previousX = mobile ? e.touches[0].clientX : e.screenX;
                previousY = mobile ? e.touches[0].clientY : e.screenY;

                JTS(window).bind(mousemove + '.jts_picker_event_' + parsedID, (eW) => {

                    eW.preventDefault();

                    currentX = mobile ? eW.touches[0].clientX : eW.screenX;
                    currentY = mobile ? eW.touches[0].clientY : eW.screenY;

                    let localX = eW.globalX;
                    let localY = eW.globalY;

                    let localParent = (document.querySelector('#jts_sb_selector_' + parsedID) as any).offsetParent;

                    while (localParent) {

                        localX -= localParent.offsetLeft;
                        localY -= localParent.offsetTop;

                        localParent = localParent.offsetParent;

                    }

                    vX = currentX - previousX;
                    vY = currentY - previousY;

                    previousX = currentX;
                    previousY = currentY;


                    const target: any = document.querySelector('#jts_sb_selector_' + parsedID);

                    let x = target.offsetLeft;
                    let y = target.offsetTop;

                    x += vX;
                    y += vY;

                    x = localX < 0 ? 0 : (localX > SATURATION_BRIGHTNESS_SIZE ? SATURATION_BRIGHTNESS_SIZE : x);
                    y = localY < 0 ? 0 : (localY > SATURATION_BRIGHTNESS_SIZE ? SATURATION_BRIGHTNESS_SIZE : y);
                    x = x < 0 ? 0 : (x > SATURATION_BRIGHTNESS_SIZE ? SATURATION_BRIGHTNESS_SIZE : x);
                    y = y < 0 ? 0 : (y > SATURATION_BRIGHTNESS_SIZE ? SATURATION_BRIGHTNESS_SIZE : y);

                    target.style.left = x + 'px';
                    target.style.top = y + 'px';

                    const data = computeColors(x, y, (document.querySelector('#jts_hue_selector_' + parsedID) as any).offsetTop);

                    if (configuration.update) {

                        JTS(element).css('background-color', data.rgb_string);

                    }

                    updatePicker(data);
                    JTS(element).emits(JTS.built_in_events.jCOLOR_PICKER_UPDATED , data);

                });
                JTS(window).bind(mouseup + '.jts_picker_event_' + parsedID,  (eW) => {

                    JTS(window).unbind('.jts_picker_event_' + parsedID);

                });

            });

            JTS('#jts_hue_selector_' + parsedID).bind(mousedown + '.jts_picker_event_' + parsedID, (e) => {

                e.preventDefault();

                currentY = mobile ? e.touches[0].clientY : e.screenY;
                previousY = mobile ? e.touches[0].clientY : e.screenY;

                JTS(window).bind(mousemove + '.jts_picker_event_' + parsedID, (eW) => {

                    eW.preventDefault();

                    currentY = mobile ? eW.touches[0].clientY : eW.screenY;

                    let localY = eW.globalY;

                    let localParent = (document.querySelector('#jts_hue_selector_' + parsedID) as any).offsetParent;

                    while (localParent) {

                        localY -= localParent.offsetTop;

                        localParent = localParent.offsetParent;

                    }

                    vY = currentY - previousY;

                    previousY = currentY;


                    const target: any = document.querySelector('#jts_hue_selector_' + parsedID);

                    let y = target.offsetTop;

                    y += vY;

                    y = localY < 0 ? 0 : (localY > HUE_CONTAINER_HEIGHT ? HUE_CONTAINER_HEIGHT : y);
                    y = y < 0 ? 0 : (y > HUE_CONTAINER_HEIGHT ? HUE_CONTAINER_HEIGHT : y);

                    target.style.top = y + 'px';

                    const sb: any = document.querySelector('#jts_sb_selector_' + parsedID);
                    const data = computeColors(sb.offsetLeft, sb.offsetTop, y);

                    if (configuration.update) {

                        JTS(element).css('background-color', data.rgb_string);

                    }

                    updatePicker(data);
                    JTS(element).emits(JTS.built_in_events.jCOLOR_PICKER_UPDATED, data);

                });
                JTS(window).bind(mouseup + '.jts_picker_event_' + parsedID, (eW) =>  {

                    JTS(window).unbind('.jts_picker_event_' + parsedID);

                });

            });

            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_shade_image')
                .bind(mouseup + '.jts_picker_event_' + parsedID, (e) => {

                let localX = e.localX;
                let localY = e.localY;

                let localParent = this;

                while (localParent) {

                    localX -= localParent.offsetLeft;
                    localY -= localParent.offsetTop;

                    localParent = localParent.offsetParent;

                }

                JTS('#jts_sb_selector_' + parsedID).css({ left: localX, top: localY });

                const data = computeColors(localX, localY, (document.querySelector('#jts_hue_selector_' + parsedID) as any).offsetTop);

                if (configuration.update) {

                    JTS(element).css('background-color', data.rgb_string);

                }

                updatePicker(data);
                JTS(element).emits(JTS.built_in_events.jCOLOR_PICKER_UPDATED, data);

            });

            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_hue_image')
                .bind(mouseup + '.jts_picker_event_' + parsedID, (e) => {

                let localY = e.localY;

                let localParent = this;

                while (localParent) {

                    localY -= localParent.offsetTop;

                    localParent = localParent.offsetParent;

                }

                JTS('#jts_hue_selector_' + parsedID).css('top', localY);

                const sb: any = document.querySelector('#jts_sb_selector_' + parsedID);
                const data = computeColors(sb.offsetLeft, sb.offsetTop, localY);

                if (configuration.update) {

                    JTS(element).css('background-color', data.rgb_string);

                }

                updatePicker(data);
                JTS(element).emits(JTS.built_in_events.jCOLOR_PICKER_UPDATED , data);

            });

            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_submit')
                .bind(mouseup + '.jts_picker_event_' + parsedID, (e) => {

                JTS(container).unbind('.jts_picker_event_' + parsedID);
                JTS('#jts_sb_selector_' + parsedID).unbind('.jts_picker_event_' + parsedID);
                JTS('#jts_hue_selector_' + parsedID).unbind('.jts_picker_event_' + parsedID);
                JTS('#jts_picker_container_' + parsedID + ' .jts_picker_shade_image').unbind('.jts_picker_event_' + parsedID);
                JTS('#jts_picker_container_' + parsedID + ' .jts_picker_hue_image').unbind('.jts_picker_event_' + parsedID);
                JTS('#jts_picker_container_' + parsedID + ' .jts_picker_submit').unbind('.jts_picker_event_' + parsedID);

                JTS(container).dispose();

                pickerOut = false;

            });

        }

        function updatePicker(data) {

            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_table').css('background-color', 'hsl(' + data.hsl[0] + ', 100% , 50%)');
            JTS('#jts_red_val_' + parsedID).html(String(data.rgb[0]));
            JTS('#jts_green_val_' + parsedID).html(String(data.rgb[1]));
            JTS('#jts_blue_val_' + parsedID).html(String(data.rgb[2]));
            JTS('#jts_exadecimal_val_' + parsedID).html(data.hexadecimal);
            JTS('#jts_picker_container_' + parsedID + ' .jts_picker_next_color').css('background-color', data.rgb_string);

        }

    }

    function parseRGBColor(e) {

        const currentStyle = getComputedStyle(e);
        let color = currentStyle.getPropertyValue('background-color');
        color = color.indexOf('rgba') !== -1 ? 'rgb(255,0,0)' : color;

        const rgbPrefixLength = 4;
        const subString = color.substring(rgbPrefixLength, color.length - 1);
        const array = subString.split(',');

        return parse(array, 0);

        function parse(a, i) {

            if (i < a.length) {

                a[i] = parseInt(a[i], null);
                return parse(a, i + 1);

            }
            else {

                return a;

            }

        }

    }

    function rGBtoHSB(rgb) {

        let hue = 0;
        let saturation = 0;
        let brightness = 0;

        /*Convert the RGB values to the range 0-1, this can be done by dividing the value by 255 for 8-bit color depth*/
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

        /*Find the minimum and maximum values of R, G and B. e delta*/
        let valoreMassimo = Math.max(r, g);
        valoreMassimo = Math.max(valoreMassimo, b);
        let valoreMinimo = Math.min(r, g);
        valoreMinimo = Math.min(valoreMinimo, b);
        const delta = valoreMassimo - valoreMinimo;

        /*Now calculate the Luminace*/
        brightness = Math.round(valoreMassimo * 100);

        /*The next step is to find the saturation and hue se delta != 0*/
        if (delta !== 0) {

            /*trova saturazione*/
            saturation = Math.round(delta / valoreMassimo * 100);
            /*calcolo hue*/
            const deltaH = delta / 2;
            let deltaR = ((valoreMassimo - r) / 6) + deltaH;
            deltaR /= delta;
            let deltaG = ((valoreMassimo - g) / 6) + deltaH;
            deltaG /= delta;
            let deltaB = ((valoreMassimo - b) / 6) + deltaH;
            deltaB /= delta;

            /*The Hue formula is depending on what RGB color channel is the max value.*/
            if (valoreMassimo === r) {

                hue = deltaB - deltaG;

            }
            else if (valoreMassimo === g) {

                hue = (1 / 3) + deltaR - deltaB;

            }
            else if (valoreMassimo === b) {

                hue = (2 / 3) + deltaG - deltaR;

            }

            if (hue < 0) {

                hue += 1;

            }
            if (hue > 1) {

                hue -= 1;
            }

            hue *= 360;
            hue = Math.round(hue);
        }

        return [hue, saturation, brightness];

    }

    function rGBtoEXADECIMAL(rgb) {

        let value = '';

        for (const n of rgb) {

            let hex = n.toString(16);
            hex = hex.length === 1 ? '0' + hex : hex;

            value += hex;

        }

        return value;

    }

    function rGBtoHSL(rgb) {

        /*Convert the RGB values to the range 0-1, this can be done by dividing the value by 255 for 8-bit color depth*/
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

        /*Find the minimum and maximum values of R, G and B.*/
        let valoreMassimo = Math.max(r, g);
        valoreMassimo = Math.max(valoreMassimo, b);
        let valoreMinimo = Math.min(r, g);
        valoreMinimo = Math.min(valoreMinimo, b);

        /*Now calculate the Luminace value by adding the max and min values anddivide by 2.*/
        let luminance = (valoreMinimo + valoreMassimo) / 2;
        const luminanceRow = luminance;
        luminance = Math.round(luminance * 100);

        /*The next step is to find the Saturation.
        If Luminance is smaller then 0.5, then Saturation = (max-min)/(max+min)
        If Luminance is bigger then 0.5. then Saturation = ( max-min)/(2.0-max-min)*/
        let saturation = 0;
        if (luminance >= 0.5) {

            saturation = (valoreMassimo - valoreMinimo) / (2.0 - valoreMassimo + valoreMinimo);

        }
        else {

            saturation = (valoreMassimo - valoreMinimo) / (valoreMassimo + valoreMinimo);

        }

        saturation = Math.round(saturation * 100);

        /*The next step is to find the hue.
        The Hue formula is depending on what RGB color channel is the max value.
        If Red is max, then Hue = (G-B)/(max-min)
        If Green is max, then Hue = 2.0 + (B-R)/(max-min)
        If Blue is max, then Hue = 4.0 + (R-G)/(max-min)*/
        let hue = 0;
        if (valoreMassimo === r) {

            hue = (g - b) / (valoreMassimo - valoreMinimo);

        }
        else if (valoreMassimo === g) {

            hue = 2.0 + (b - r) / (valoreMassimo - valoreMinimo);

        }
        else if (valoreMassimo === b) {

            hue = 4.0 + (r - g) / (valoreMassimo - valoreMinimo);

        }
        /*The Hue value you get needs to be multiplied by 60 to convert it to degrees on the color circle
        If Hue becomes negative you need to add 360 to, because a circle has 360 degrees.*/
        hue = Math.round(hue * 60);
        if (hue < 0) {

            hue += 360;

        }

        return [Math.round(hue), Math.round(saturation), Math.round(luminance)];

    }

    function hSBtoRGB(hsb) {

        let r = 0;
        let g = 0;
        let bRGB = 0;

        const h = (hsb[0] / 360);
        const s = (hsb[1] / 100);
        const b = (hsb[2] / 100);
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = b * (1 - s);
        const q = b * (1 - f * s);
        const innerT = b * (1 - (1 - f) * s);

        let rV;
        let gV;
        let bV;

        switch (i % 6) {

            case 0: rV = b; gV = innerT; bV = p; break;
            case 1: rV = q; gV = b; bV = p; break;
            case 2: rV = p; gV = b; bV = innerT; break;
            case 3: rV = p; gV = q; bV = b; break;
            case 4: rV = innerT; gV = p; bV = b; break;
            case 5: rV = b; gV = p; bV = q; break;

        }

        rV = Math.floor(rV * 255);
        gV = Math.floor(gV * 255);
        bV = Math.floor(bV * 255);

        r = rV;
        g = gV;
        bRGB = bV;

        return [r, g, bRGB];

    }

    function computeColors(sbX, sbY, hueY) {

        let h = hueY * (HUE_RANGE / HUE_CONTAINER_HEIGHT);
        h = HUE_RANGE + (-h);

        const s = sbX * (100 / SATURATION_BRIGHTNESS_SIZE);
        let b = sbY * (100 / SATURATION_BRIGHTNESS_SIZE);
        b = 100 + (-b);

        const hsb = [h, s, b];
        const rgb = hSBtoRGB(hsb);
        const hsl = rGBtoHSL(rgb);
        const hexadecimal = rGBtoEXADECIMAL(rgb);
        const rgbString = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
        const hslString = 'hsl(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%)';

        return {
            hsb,
            hsl,
            rgb,
            hexadecimal,
            hsl_string: hslString,
            rgb_string: rgbString
        };

    }

    return this;

};

JTS.prototype.cropper = function(file , callback?, configuration?: any) {

    const t = this;

    const BYTES_SIZE = 1024 * 1024 * 10;
    const BORDER_VX = 350;

    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {

        console.log('accepts-only-.jpg-.png-.gif-files @jTSCropper');
        return;

    }

    if (file.size > BYTES_SIZE) {

        console.log('max-size-allowed-10MB @jTSCropper');
        return;

    }

    const onMobile = JTS.jMobile();
    const cropperID = new Date().getTime() + '' + Math.floor(Math.random() * 500);

    const mousedown = onMobile ? 'touchstart' : 'mousedown';
    const mousemove = onMobile ? 'touchmove' : 'mousemove';
    const mouseup =   onMobile ? 'touchend' : 'mouseup';

    let originalWidth;
    let originalHeight;
    let originalBlobSrc;
    let type;
    let name;
    let extension;
    let image;
    let currentWidth;
    let currentHeight;
    let imageWidth;
    let imageHeight;
    let base;
    let cropBase;
    let croppedImage;
    let cropSpot;
    let cropBorder;
    let controls;
    let doneB;
    let closeB;
    let resetB;
    let sizeLabel;

    const cropperHandlesArray = [];
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = () => {

        const blob = new Blob([reader.result]);
        const src = window.URL.createObjectURL(blob);

        type = file.type;
        originalBlobSrc = src;
        name = file.name.split('.')[0];
        extension = '.' + file.name.split('.')[1];

        setImage();

    };

    function addCropper() {

        const offsetParent = document.querySelector('body');

        base = document.createElement('div');
        cropBase = document.createElement('div');
        cropSpot = document.createElement('div');
        cropBorder = document.createElement('div');
        controls = document.createElement('div');
        doneB = document.createElement('div');
        closeB = document.createElement('div');
        resetB = document.createElement('div');
        sizeLabel = document.createElement('div');

        croppedImage = new Image();
        croppedImage.alt = 'jts_cropper_img';
        croppedImage.src = image.src;

        JTS(base).css({

            position: 'fixed',
            left: 0,
            top: 0,
            'z-index': 100,
            'background-color': 'rgba(255,255,225,0)'

        }).addClass('jts_cropper_' + cropperID).attr('id', 'jts_cropper_base_' + cropperID);

        JTS(cropBase).css({

            position: 'absolute',
            left: 0,
            top: 0,
            'z-index': 100,
            'background-color': configuration && configuration.overflow_background ? configuration.overflow_background : 'rgba(255,0,0,0.6)'

        }).addClass('jts_cropper_' + cropperID);

        JTS(croppedImage).css({

            position: 'absolute'

        }).addClass('jts_cropper_' + cropperID);

        JTS(cropSpot).css({

            position: 'absolute',
            overflow: 'hidden',
            'z-index': 105,
            'background-color': configuration && configuration.crop_background ? configuration.crop_background : '#ffffff'

        }).addClass('jts_cropper_' + cropperID);

        JTS(cropBorder).css({

            position: 'absolute',
            'z-index': 110

        }).addClass('jts_cropper_' + cropperID).addClass('jts_cropper_border_' + cropperID);

        JTS(controls).css({

            position: 'absolute',
            'z-index': 150,
            height: 50,
            bottom: 50,
            width: 190,
            overflow: 'visible',
            left: 'calc(50% - 95px)'

        }).addClass('jts_cropper_' + cropperID);

        JTS(resetB).css({

            left: 0,
            'background-color' : configuration && configuration.controls_background ? configuration.controls_background : 'rgba(255,255,255,0.5)',
            color : configuration && configuration.controls_color ? configuration.controls_color : '#303030',
            'box-shadow' : configuration && configuration.controls_shadow ? configuration.controls_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)',
            'border-radius' : configuration && configuration.controls_radius ? configuration.controls_radius : 3

        }).addClass('jts-crop-control').append('<i class="fab fa-rev"></i>');

        JTS(doneB).css({

            left: 70,
            'background-color' : configuration && configuration.controls_background ? configuration.controls_background : 'rgba(255,255,255,0.5)',
            color : configuration && configuration.controls_color ? configuration.controls_color : '#303030',
            'box-shadow' : configuration && configuration.controls_shadow ? configuration.controls_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)',
            'border-radius' : configuration && configuration.controls_radius ? configuration.controls_radius : 3


        }).addClass('jts-crop-control').append('<i class="fa fa-check-double"></i>');

        JTS(closeB).css({

            left: 140,
            'background-color' : configuration && configuration.controls_background ? configuration.controls_background : 'rgba(255,255,255,0.5)',
            color : configuration && configuration.controls_color ? configuration.controls_color : '#303030',
            'box-shadow' : configuration && configuration.controls_shadow ? configuration.controls_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)',
            'border-radius' : configuration && configuration.controls_radius ? configuration.controls_radius : 3


        }).addClass('jts-crop-control').append('<i class="fa fa-times-circle"></i>');

        JTS(sizeLabel).css({

            position : 'absolute',
            top : -87,
            left : 'calc(50% - 75px)',
            'border-radius': 3,
            color : '#f1f1f1',
            'background-color' : '#000000',
            padding : 10,
            'font-size' : 15,
            'box-shadow' : '2px 2px 5px 0px rgba(0,0,0,0.3)',
            'font-family' : 'Helvetica',
            width: 150,
            'text-align': 'center'

        }).addClass('jts-crop-size-label');

        const borderColor = configuration && configuration.border_color ? configuration.border_color : '#ffffff';

        const style = '<style type="text/css" id="cropper_style_' + cropperID + '">' +
            '.jts_cropper_border_' + cropperID + '::before{' +
            'width:100%;height:100%;z-index:3;content:"";' +
            'position:absolute;left:0;top:0;' +
            'background-image : linear-gradient(90deg , ' + borderColor + ' , ' + borderColor + ' 50% , transparent 50% , transparent) , ' +
            'linear-gradient(90deg , ' + borderColor + ' , ' + borderColor + ' 50% , transparent 50% , transparent); ' +
            'background-position : top left , bottom right; ' +
            'background-size : 50px 1px , 50px 1px;' +
            'background-repeat : repeat-x , repeat-x;' +
            'animation-delay:0s; animation-direction:normal;' +
            'animation-iteration-count:infinite;animation-timing-function:linear;' +
            'animation-fill-mode:initial;animation-name:cropper-border-tb;' +
            '}' +
            '@keyframes cropper-border-tb{100%{background-position:top right , bottom left;}}' +
            '.jts_cropper_border_' + cropperID + '::after{' +
            'width:100%;height:100%;z-index:3;content:"";' +
            'position:absolute;left:0;top:0;' +
            'background-image : linear-gradient(transparent , transparent 50% , ' + borderColor + ' 50% , ' + borderColor + ' ) , ' +
            'linear-gradient(transparent , transparent 50% , ' + borderColor + ' 50% , ' + borderColor + ' );' +
            'background-position : top right , bottom left; ' +
            'background-size : 1px 50px , 1px 50px;' +
            'background-repeat : repeat-y , repeat-y;' +
            'animation-delay:0s; animation-direction:normal;' +
            'animation-iteration-count:infinite;animation-timing-function:linear;' +
            'animation-fill-mode:initial;animation-name:cropper-border-lr;' +
            '}' +
            '@keyframes cropper-border-lr{100%{background-position:bottom right , top left;}}' +
            '.jts-crop-size-label::after{content:"";position: absolute; top : 100%; left: calc(50% - 15px);border:solid 15px transparent;border-top-color:#000000 ;}' +
            '</style>';
        const styleBA = '<style type="text/css" id="cropper_style_ba_' + cropperID + '">' +
            '.jts_cropper_border_' + cropperID + '::before{animation-duration:' + Math.floor((imageWidth / BORDER_VX) * 100) / 100 + 's;}' +
            '.jts_cropper_border_' + cropperID + '::after{animation-duration:' + Math.floor((imageHeight / BORDER_VX) * 100) / 100 + 's;}' +
            '</style>';

        JTS('head').append([style, styleBA]);

        JTS(cropSpot).append(croppedImage);
        JTS(controls).append([doneB, resetB, closeB]);
        JTS(cropBorder).append(sizeLabel);
        JTS(base).append([image, cropBase, cropSpot, cropBorder, controls]);
        JTS(offsetParent).append(base);

        JTS('.jts-crop-control').css({

            position: 'absolute',
            width: 50,
            height: 50,
            top: 0,
            cursor: 'pointer',
            'font-size' : 40,
            padding : '3px 0px 0px 0px',
            'text-align' : 'center'

        });

        setSize();
        addLiquidFunctions();
        setListeners();

    }

    function addLiquidFunctions() {

        const MINIMUM_SIZE = 100;

        const nameSet = ['lh', 'th', 'rh', 'bh', 'tlh', 'trh', 'blh', 'brh', 'mover'];
        const cssSet = [
            { width: 30, height: 30, left: -15, top: 'calc(50% - 15px)', cursor: 'ew-resize' },
            { width: 30, height: 30, left: 'calc(50% - 15px)', top: -15, cursor: 'ns-resize' },
            { width: 30, height: 30, right: -15, top: 'calc(50% - 15px)', cursor: 'ew-resize' },
            { width: 30, height: 30, left: 'calc(50% - 15px)', bottom: -15, cursor: 'ns-resize' },
            { width: 30, height: 30, left: -15, top: -15, cursor: 'nw-resize' },
            { width: 30, height: 30, right: -15, top: -15, cursor: 'ne-resize' },
            { width: 30, height: 30, left: -15, bottom: -15, cursor: 'sw-resize' },
            { width: 30, height: 30, right: -15, bottom: -15, cursor: 'se-resize' },
            { width: 50, height: 50, left: 'calc(50% - 25px)', top: 'calc(50% - 25px)', cursor: 'move' }
        ];

        createHandles(0);

        function createHandles(index) {

            if (index < nameSet.length) {

                const currentHandle = document.createElement('div');

                const css = {

                    'background-color': configuration && configuration.handles_color ?
                        configuration.handles_color : 'rgba(255,255,255,0.5)',
                    position: 'absolute',
                    'z-index': 10

                };

                currentHandle.setAttribute('name', nameSet[index]);
                currentHandle.setAttribute('class', 'jts_cropper_handle_' + cropperID);

                JTS(currentHandle).css(css).css(cssSet[index]);
                JTS(cropBorder).append(handle);

                cropperHandlesArray.push(currentHandle);

                createHandles(index + 1);

            }

        }

        let cX;
        let cY;
        let pX;
        let pY;
        let vX;
        let vY;
        let handle;

        JTS('.jts_cropper_handle_' + cropperID).bind(mousedown + '.jts_cropper_handle_liquid_' + cropperID,
            (e) => {

                e.preventDefault();

                pX = onMobile ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX;
                pY = onMobile ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY;

                handle = JTS(e.target).attr('name');

                JTS(window).bind(mousemove + '.jts_cropper_handle_liquid_' + cropperID ,
                     (eW) => {

                        cX = onMobile ? eW.originalEvent.touches[0].clientX : eW.originalEvent.clientX;
                        cY = onMobile ? eW.originalEvent.touches[0].clientY : eW.originalEvent.clientY;

                        vX = cX - pX;
                        vY = cY - pY;

                        pX = cX;
                        pY = cY;

                        switch (handle) {
                            case 'lh':
                                vX = -vX; vY = 0; break;
                            case 'th':
                                vX = 0; vY = -vY; break;
                            case 'rh':
                                vY = 0; break;
                            case 'bh':
                                vX = 0; break;
                            case 'tlh':
                                vX = -vX; vY = -vY; break;
                            case 'trh':
                                vY = -vY; break;
                            case 'blh':
                                vX = -vX; break;
                            case 'brh':
                                break;
                            case 'mover':
                                break;
                        }

                        liquidResize(vX, vY, e);

                    }).bind(mouseup + '.jts_cropper_handle_liquid_' + cropperID , (eW) => {

                        JTS(window).unbind('.jts_cropper_handle_liquid_' + cropperID);

                    });

            });

        function liquidResize(pVX, pVY, e) {

            let w = JTS(cropBorder).outerWidth();
            let h = JTS(cropBorder).outerHeight();

            const left = cropBorder.offsetLeft;
            const top = cropBorder.offsetTop;

            let x = left;
            let y = top;

            if (handle !== 'mover') {

                if ((e.ctrlKey && e.shiftKey) && (handle === 'trh' || handle === 'tlh' || handle === 'brh' || handle === 'blh')) {

                    if (Math.abs(pVX) > Math.abs(pVY)) {

                        pVY = pVX;

                    }
                    else {

                        pVX = pVY;

                    }


                }

                const right = left + w;
                const bottom = top + h;

                if (w + pVX < MINIMUM_SIZE) {

                    w = MINIMUM_SIZE;

                }
                else if (right + pVX > image.offsetLeft + JTS(image).outerWidth() &&
                    (handle === 'rh' || handle === 'trh' || handle === 'brh')) {

                    w = (image.offsetLeft + JTS(image).outerWidth()) - left;

                }
                else if (left + -pVX < image.offsetLeft && (handle === 'lh' || handle === 'tlh' || handle === 'blh')) {

                    w = right - image.offsetLeft;

                }
                else {

                    w += pVX;

                }

                if (h + pVY < MINIMUM_SIZE) {

                    h = MINIMUM_SIZE;

                }
                else if (bottom + pVY > image.offsetTop + JTS(image).outerHeight() && (handle === 'blh' || handle === 'bh' || handle === 'brh')) {

                    h = (image.offsetTop + JTS(image).outerHeight()) - top;

                }
                else if (top + -pVY < image.offsetTop && (handle === 'th' || handle === 'tlh' || handle === 'trh')) {

                    h = bottom - image.offsetTop;

                }
                else {

                    h += pVY;

                }

                switch (handle) {
                    case 'lh':
                        x = right - w;
                        break;
                    case 'th':
                        y = bottom - h;
                        break;
                    case 'tlh':
                        x = right - w;
                        y = bottom - h;
                        break;
                    case 'trh':
                        y = bottom - h;
                        break;
                    case 'blh':
                        x = right - w;
                        break;
                }


            }
            else {

                x += pVX;
                y += pVY;
                checkBorder();

            }

            const css = {

                width: w,
                height: h,
                left: x,
                top: y

            };

            JTS(cropBorder).css(css);


            synchronizes();

            function synchronizes() {

                JTS(cropSpot).css({

                    width: JTS(cropBorder).outerWidth(),
                    height: JTS(cropBorder).outerHeight(),
                    left: cropBorder.offsetLeft,
                    top: cropBorder.offsetTop

                });

                JTS(croppedImage).css({

                    left: image.offsetLeft - cropSpot.offsetLeft,
                    top: image.offsetTop - cropSpot.offsetTop

                });

                JTS(sizeLabel).html('<span>width : ' + w + 'px</span><br><span>height : ' + h + 'px</span>');

                const styleBA = '.jts_cropper_border_' + cropperID +
                    '::before{animation-duration:' + Math.floor((w / BORDER_VX) * 100) / 100 + 's;}' +
                    '.jts_cropper_border_' + cropperID + '::after{animation-duration:' + Math.floor((h / BORDER_VX) * 100) / 100 + 's;}';

                JTS('#cropper_style_ba_' + cropperID).html(styleBA);

            }

            function checkBorder() {

                if (x < image.offsetLeft) {

                    x = image.offsetLeft;

                }

                if (y < image.offsetTop) {

                    y = image.offsetTop;

                }

                if (x + JTS(cropBorder).outerWidth() > image.offsetLeft + JTS(image).outerWidth()) {

                    x = (image.offsetLeft + JTS(image).outerWidth()) - JTS(cropBorder).outerWidth();

                }

                if (y + JTS(cropBorder).outerHeight() > image.offsetTop + JTS(image).outerHeight()) {

                    y = (image.offsetTop + JTS(image).outerHeight()) - JTS(cropBorder).outerHeight();

                }

            }

        }

    }

    function croppingDone(){

        const cropX = cropBorder.offsetLeft - image.offsetLeft;
        const cropY = cropBorder.offsetTop - image.offsetTop;
        const cropW = JTS(cropBorder).outerWidth();
        const cropH = JTS(cropBorder).outerHeight();

        const parsedCX = Math.round(cropX * (originalWidth / imageWidth));
        const parsedCY = Math.round(cropY * (originalHeight / imageHeight));
        const parsedCW = Math.round(cropW * (originalWidth / imageWidth));
        const parsedCH = Math.round(cropH * (originalHeight / imageHeight));

        const canvas = document.createElement('canvas');

        canvas.width = parsedCW;
        canvas.height = parsedCH;

        const brush = canvas.getContext('2d');

        brush.drawImage(image, parsedCX, parsedCY, parsedCW, parsedCH, 0, 0, canvas.width, canvas.height);

        const src = canvas.toDataURL(type, 1.0);
        const r = new XMLHttpRequest();

        r.open('get', src);

        r.responseType = 'arraybuffer';
        r.onreadystatechange = () => {

            if (r.readyState === 4) {

                if (r.status === 200) {

                    const blob: any = new Blob([r.response], { type });
                    const blobSRC = URL.createObjectURL(blob);
                    const parsedCroppedImage = new Image();

                    blob.lastModified = new Date().getTime();
                    blob.lastModifiedDate = new Date();
                    blob.name = name + extension;

                    parsedCroppedImage.alt = 'jts_cropped_image';
                    parsedCroppedImage.src = blobSRC;

                    const data = {

                        image_original_width: originalWidth,
                        image_original_height: originalHeight,
                        image_original: image,
                        image_cropped: parsedCroppedImage,
                        file_original: file,
                        file_cropped: blob,
                        type,
                        src_original: originalBlobSrc,
                        src_crop: blobSRC,
                        crop_x: parsedCX,
                        crop_y: parsedCY,
                        crop_width: parsedCW,
                        crop_height: parsedCH,
                        extension,
                        file_name: name

                    };

                    if (callback) {

                        callback(data);

                    }

                    JTS(window).emits(JTS.built_in_events.jCROPPER_DONE, data);
                    dispose();

                }
                else {

                    console.log('unknown-error @jTSCropper');
                    dispose();

                }

            }

        };

        r.send(null);

    }

    function dispose() {

        JTS(window).unbind('.jts_cropper_events_' + cropperID);
        JTS(resetB).unbind('.jts_cropper_events_' + cropperID);
        JTS(closeB).unbind('.jts_cropper_events_' + cropperID);
        JTS(doneB).unbind('.jts_cropper_events_' + cropperID);
        JTS(cropperHandlesArray).unbind('.jts_cropper_handle_liquid_' + cropperID);
        JTS('#cropper_style_ba_' + cropperID).dispose();
        JTS('#cropper_style_' + cropperID).dispose();

        if (JTS(base).offsetPs().length > 0) {

            JTS(base).dispose();

        }

    }

    function findSize() {

        const SIZE_GAP = 60;

        currentWidth = JTS(window).outerWidth();
        currentHeight = JTS(window).outerHeight();

        const data: any = getData(currentWidth - SIZE_GAP, currentHeight - SIZE_GAP);

        imageWidth = Math.round(data.width);
        imageHeight = Math.round(data.height);

        function getData(w, h) {

            if (w > originalWidth) {

                w = originalWidth;

            }

            if (h > originalHeight) {

                h = originalHeight;

            }

            let width;
            let height;

            const currentData: any = {};

            if (originalWidth > originalHeight) {

                parseW(w);

            }
            else {

                parseH(h);

            }

            function parseW(parsedW) {

                width = parsedW;
                height = originalHeight * (width / originalWidth);

                if (height > currentHeight - SIZE_GAP) {

                    parseW(parsedW - 1);

                }

            }

            function parseH(parsedH) {

                height = parsedH;
                width = originalWidth * (height / originalHeight);

                if (width > currentWidth - SIZE_GAP) {

                    parseH(parsedH - 1);

                }

            }

            currentData.width = width;
            currentData.height = height;

            return currentData;

        }

    }

    function getRootN() {

        let eParent = base;
        let rParent = eParent;

        while (eParent) {

            eParent = JTS(eParent).offsetPs()[0];

            if (eParent) {

                rParent = eParent;

            }

        }

        if (rParent.nodeName.toLowerCase() !== '#document') {

            dispose();
            return false;

        }
        else {

            return true;

        }

    }

    function setImage() {

        image = new Image();

        image.alt = 'jts_cropper_img';
        image.onload = () => {

            originalWidth = image.naturalWidth || image.width;
            originalHeight = image.naturalHeight || image.height;

            JTS(window).bind('resize.jts_cropper_events_' + cropperID ,
                () => {

                    if (!getRootN()) {

                        return;

                    }

                    findSize();
                    setSize();

                });

            JTS(window).bind('click.jts_cropper_events_' + cropperID,
                () => {

                    if (!getRootN()) {

                        return;

                    }

                });

            findSize();
            addCropper();

        };

        image.src = originalBlobSrc;

        JTS(image).css('position', 'absolute').addClass('jts_cropper_' + cropperID);

    }

    function setListeners() {

        JTS(resetB).bind(mouseup + '.jts_cropper_events_' + cropperID , (e) => {

            findSize();
            setSize();

        });

        JTS(closeB).bind(mouseup + '.jts_cropper_events_' + cropperID , (e) => {

            dispose();
            JTS(window).emits(JTS.built_in_events.jCROPPER_ONLY_CLOSED);

        });

        JTS(doneB).bind(mouseup + '.jts_cropper_events_' + cropperID, (e) => {

            croppingDone();

        });

    }

    function setSize() {

        JTS(base).css({

            width: currentWidth,
            height: currentHeight

        });

        JTS(image).css({

            width: imageWidth,
            height: imageHeight,
            left: Math.round((currentWidth * 0.5) - (imageWidth * 0.5)),
            top: Math.round((currentHeight * 0.5) - (imageHeight * 0.5))

        });

        JTS(cropBase).css({

            width: currentWidth,
            height: currentHeight

        });

        JTS(cropSpot).css({

            width: imageWidth,
            height: imageHeight,
            left: Math.round((currentWidth * 0.5) - (imageWidth * 0.5)),
            top: Math.round((currentHeight * 0.5) - (imageHeight * 0.5))

        });

        JTS(croppedImage).css({

            width: imageWidth,
            height: imageHeight,
            left: image.offsetLeft - cropSpot.offsetLeft,
            top: image.offsetTop - cropSpot.offsetTop

        });

        JTS(cropBorder).css({

            width: imageWidth,
            height: imageHeight,
            left: Math.round((currentWidth * 0.5) - (imageWidth * 0.5)),
            top: Math.round((currentHeight * 0.5) - (imageHeight * 0.5))

        });

        JTS(sizeLabel).html('<span>width : ' + parseInt(imageWidth, null) + 'px</span><br><span>height : ' + parseInt(imageHeight, null) + 'px</span>');

        const styleBA = '.jts_cropper_border_' + cropperID +
            '::before{animation-duration:' + Math.floor((imageWidth / BORDER_VX) * 100) / 100 + 's;}' +
            '.jts_cropper_border_' + cropperID + '::after{animation-duration:' + Math.floor((imageHeight / BORDER_VX) * 100) / 100 + 's;}';

        JTS('#cropper_style_ba_' + cropperID).html(styleBA);

    }

    return this;

};

JTS.prototype.css = function(properties: any , value?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (arguments.length === 1 && typeof arguments[0] === 'string') {

        return getProperty(properties);

    }
    else if (arguments.length === 1 && typeof arguments[0] === 'object') {

        setProperties(properties);

    }
    else if (arguments.length === 2 && typeof arguments[0] === 'string') {

        const propertiesObject = {};

        propertiesObject[properties] = value;
        setProperties(propertiesObject);

    }
    else{

        console.log(`JTS@css : arguments list error`);
        return t;

    }

    function getProperty(p) {

        let parsedValue;

        switch (p) {

            case 'bottom':
                const a = getPropertyValue(t[0], p);
                const b = t[0].offsetParent.getBoundingClientRect().height;
                const c = (t[0].offsetTop + t[0].getBoundingClientRect().height);
                parsedValue =  a || b - c  + 'px';
                break;
            case 'height':
                parsedValue = t[0].getBoundingClientRect().height + 'px';
                break;
            case 'left':
                parsedValue = getPropertyValue(t[0], p) || t[0].offsetLeft + 'px';
                break;
            case 'margin':
                parsedValue = JSON.stringify({
                    left: getPropertyValue(t[0], 'margin-left'), top: getPropertyValue(t[0], 'margin-top'),
                    right: getPropertyValue(t[0], 'margin-right'), bottom: getPropertyValue(t[0], 'margin-bottom')
                });
                break;
            case 'padding':
                parsedValue = JSON.stringify({
                    left: getPropertyValue(t[0], 'padding-left'), top: getPropertyValue(t[0], 'padding-top'),
                    right: getPropertyValue(t[0], 'padding-right'), bottom: getPropertyValue(t[0], 'padding-bottom')
                });
                break;
            case 'right':
                const d = getPropertyValue(t[0], p);
                const e = t[0].offsetParent.getBoundingClientRect().width;
                const f = (t[0].offsetLeft + t[0].getBoundingClientRect().width);
                parsedValue = d || e - f + 'px';
                break;
            case 'top':
                parsedValue = getPropertyValue(t[0], p) || t[0].offsetTop + 'px';
                break;
            case 'width':
                parsedValue = t[0].getBoundingClientRect().width + 'px';
                break;
            default:
                parsedValue = getPropertyValue(t[0], p);
                break;

        }

        function getPropertyValue(e, property) {

            return e.style[parsePropertyName(property)] || getFromComputed(e, property) || JTS.cssMap[property];

        }

        function getFromComputed(e, property) {

            return getComputedStyle(e).getPropertyValue(property);

        }

        return parsedValue;

    }

    function setProperties(p) {

        t.each((i , e) => {

            for (const cssProperty in p) {

                if (p.hasOwnProperty(cssProperty)){

                    const ask = (typeof p[cssProperty]).toLowerCase() === 'number';
                    const v = ask ? getValueExtension(cssProperty, p[cssProperty]) : String(p[cssProperty]);

                    e.style.setProperty(cssProperty, v , '');

                }

            }

        });

        function getValueExtension(n, v) {

            const PROPERTIES_SET = ['z-index', 'opacity', 'font-weight', 'line-height', 'fill-opacity', 'column-count'];

            let flag = false;

            for (const current of PROPERTIES_SET) {

                if (n === current) {

                    flag = true;
                    break;

                }

            }

            if (!flag) {

                v = v + 'px';

            }

            return v;

        }

    }

    function parsePropertyName(p) {

        const array = p.split('-');
        const name = array[0];

        function addChunk(n , i) {

            if (array.length === 1) {

                return n;

            }

            n += array[i].charAt(0).toUpperCase() + array[i].slice(1);

            if (i === array.length - 1) {

                return n;

            }
            else {

                return addChunk(n, i + 1);

            }

        }

        return addChunk(name , 1);

    }

    return this;

};

JTS.prototype.datePicker = function(configuration?: any){

    const Y_GAP = 5;
    const MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'];
    const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const DATE_FORMAT = configuration && configuration.format ? configuration.format : 'd/m/y';
    const PRESS_DELAY = 150;

    addStyles();

    this.each(  (i, e) => addDatePickerFeatures(i, e) );

    function addDatePickerFeatures(i, e) {

        const element = e;
        const jElement = JTS(e);
        let pickerOpen = false;
        let mousePressed = false;
        let pressID = null;

        jElement.bind('keydown keyup.jts_date_picker_events', (event) => {

            event.preventDefault();

        });

        jElement.bind('click.jts_date_picker_events', showPicker);

        function showPicker(event){

            event.preventDefault();

            if (!pickerOpen){

                pickerOpen = true;
                openPicker();

            }

        }

        function openPicker(){

            let currentDate = null;
            let currentMonth = null;
            let currentYear = null;
            let currentDay = null;

            const pickerBox = JTS('<div class="date_picker_box"></div>');
            const previousButton = JTS('<div class="dp_previous_button dp_top_button"><i class="fa fa-caret-square-left"></i></div>');
            const nextButton = JTS('<div class="dp_next_button dp_top_button"><i class="fa fa-caret-square-right"></i></div>');
            const monthYearTop = JTS('<div class="dp_top_month_year ts-font-elegance"></div>');
            const monthDaysBox = JTS('<div class="dp_month_days_box"></div>');

            let currentShowedDays = [];

            setMainBoard();

            setCoordinates();

            if (configuration && configuration.onBeforePicker){

                configuration.onBeforePicker(pickerBox);

            }

            JTS('body').append(pickerBox);
            setCurrentData();
            setListeners();

            function activateShowedDays(){

                currentShowedDays.forEach((current) => {

                    current.bind('click.jts_ts_date_picker_events', function(event){

                        const date = JTS(this).attr('data-date_ref');

                        jElement.value(date);
                        disposePicker();

                    });

                });

            }

            function deactivateShowedDays(){

                currentShowedDays.forEach((current) => current.unbind('click') );

            }

            function disposePicker(){

                pickerBox.unbind('mousedown mouseup');
                previousButton.unbind('click');
                nextButton.unbind('click');
                jElement.unbind('focusout.jts_date_picker_events');

                deactivateShowedDays();

                pickerBox.hide(300, {

                    method : 'fade',
                    endCB : () => {

                        pickerBox.dispose();
                        pickerOpen = false;

                    }

                });

            }

            function getCoordinates(){

                let parent = element;
                let x = 0;
                let y = 0;

                while (parent){

                    x += parent.offsetLeft;
                    y += parent.offsetTop;
                    parent = parent.offsetParent;

                }

                return { x , y};

            }

            function getFormattedDate(currentDayDate){

                let currentDayString = '';
                let isTheSameDate = false;

                if (DATE_FORMAT === 'd/m/y'){

                    currentDayString = `${currentDayDate.getDate()}/${(currentDayDate.getMonth() + 1)}/${currentDayDate.getFullYear()}`;

                    if (currentDayString === currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear()) {

                        isTheSameDate = true;

                    }

                }
                else if (DATE_FORMAT === 'y/m/d'){

                    currentDayString = `${currentDayDate.getFullYear()}/${(currentDayDate.getMonth() + 1)}/${currentDayDate.getDate()}`;

                    if (currentDayString === currentDate.getFullYear() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getDate()) {

                        isTheSameDate = true;

                    }

                }

                return { currentDayDateString : currentDayString , isTheSameDate};

            }

            function getNextMonth(){

                currentMonth = currentMonth + 1 === 12 ? 0 : currentMonth + 1;
                currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;

                setHeaderText();
                deactivateShowedDays();
                setMonthDays();

            }

            function getPreviousMonth(){

                currentMonth = currentMonth - 1 === -1 ? 11 : currentMonth - 1;
                currentYear = currentMonth === 11 ? currentYear - 1 : currentYear;

                setHeaderText();
                deactivateShowedDays();
                setMonthDays();

            }

            function pressPreviousMonth() {

                if (mousePressed){

                    getPreviousMonth();

                    pressID = setTimeout(pressPreviousMonth, PRESS_DELAY);

                }

            }

            function pressNextMonth() {

                if (mousePressed){

                    getNextMonth();

                    pressID = setTimeout(pressNextMonth, PRESS_DELAY);

                }

            }

            function setCoordinates(){

                const coordinates = getCoordinates();

                pickerBox.css({ top : coordinates.y + jElement.outerHeight() + Y_GAP , left : coordinates.x });

            }

            function setCurrentData(){

                let data = jElement.value();

                if (data !== ''){

                    data = data.split('/');

                    if (DATE_FORMAT === 'd/m/y'){

                        currentDate = new Date( parseInt(data[2], null), parseInt((data[1] - 1).toString(), null), parseInt(data[0], null));

                    }
                    else if (DATE_FORMAT === 'y/m/d'){

                        currentDate = new Date( parseInt(data[0], null), parseInt((data[1] - 1).toString(), null), parseInt(data[2], null));

                    }

                }
                else{

                    currentDate = new Date();

                }

                currentMonth = currentDate.getMonth();
                currentYear = currentDate.getFullYear();
                currentDay = currentDate.getDate();

                setHeaderText();
                setMonthDays();

            }

            function setHeaderText(){

                monthYearTop.html(MONTHS[currentMonth].toUpperCase() + ' ' + currentYear);

            }

            function setListeners(){

                pickerBox.bind('mousedown mouseup.jts_date_picker_events', (event) => event.preventDefault());

                previousButton.bind('click.jts_date_picker_events', (event) => getPreviousMonth());

                nextButton.bind('click.jts_date_picker_events', (event) => getNextMonth());

                previousButton.mouseDown('jts_date_picker_events', (event) => {

                    mousePressed = true;

                    pressID = setTimeout(pressPreviousMonth, PRESS_DELAY);

                });

                nextButton.mouseDown('jts_date_picker_events', (event) => {

                    mousePressed = true;

                    pressID = setTimeout(pressNextMonth, PRESS_DELAY);

                });

                previousButton.mouseUp('jts_date_picker_events', (event) => {

                    mousePressed = false;

                    clearTimeout(pressID);

                });

                nextButton.mouseUp('jts_date_picker_events', (event) => {

                    mousePressed = false;

                    clearTimeout(pressID);

                });

                jElement.bind('focusout.jts_date_picker_events', (event) => disposePicker());

            }

            function setMainBoard(){

                const pickerHeader = JTS('<div class="date_picker_header"></div>');

                const weekDaysRow = JTS('<div class="dp_week_days_row"></div>');

                for (const day of WEEK_DAYS){

                    const weekDayTh = JTS('<div class="dp_week_day_th ts-font-elegance">' + day + '</div>');

                    if (configuration && configuration.onBeforeWeekDays){

                        configuration.onBeforeWeekDays(weekDayTh);

                    }

                    weekDaysRow.append(weekDayTh);

                }

                if (configuration && configuration.onBeforeInterface){

                    configuration.onBeforeInterface(pickerHeader, previousButton, monthYearTop, nextButton);

                }

                pickerHeader.append(previousButton).append(monthYearTop).append(nextButton);
                pickerBox.append(pickerHeader).append(weekDaysRow).append(monthDaysBox);

            }

            function setMonthDays(){

                monthDaysBox.html('');
                currentShowedDays = [];

                const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const startGap = new Date(currentYear, currentMonth, 1).getDay();

                for (let index = 0; index < startGap; index++){

                    const fakeDay = JTS('<div class="dp_fake_day"></div>');

                    monthDaysBox.append(fakeDay);

                }

                for (let l = 0; l < daysInCurrentMonth; l++){

                    const currentDayDate = new Date(currentYear, currentMonth, (l + 1));
                    const formattedData = getFormattedDate(currentDayDate);

                    const realDay = JTS('<div class="dp_real_day"></div>');
                    const dayInner = JTS('<div class="dp_inner_day ts-font-elegance" data-date_ref="' + formattedData.currentDayDateString + '">' + (l + 1) + '</div>');

                    if (formattedData.isTheSameDate){

                        dayInner.addClass('dp_current_highlighted_day');

                    }

                    if (configuration && configuration.onShowDay){

                        configuration.onShowDay(currentDayDate, dayInner, realDay);

                    }

                    realDay.append(dayInner);
                    monthDaysBox.append(realDay);
                    currentShowedDays.push(dayInner);

                }

                activateShowedDays();

            }

        }

    }

    function addStyles(){

        const pickerStyle = '<style type="text/css" id="date_picker_style">' +
            '.date_picker_box{position: absolute;width: 300px;height: 300px;border-radius: 5px;' +
            'z-index: 1;background-color: #ffffff;border: solid 1px #b2b2b2;box-shadow: 3px 3px 5px 0 rgba(0, 0, 0, 0.3);' +
            'padding: 5px;}.date_picker_header {position: relative;width: 100%;height: 50px;border-radius: 5px;' +
            'background-color: #e5e5e5;}.dp_top_button {position: relative;width: 50px;height: 100%;font-size: 40px;' +
            'color: #f1f1f1;cursor: pointer;padding: 3px 5px;float: left;}.dp_top_month_year {position: relative;' +
            'height: 100%;width: calc(100% - 100px);color: #fbfbfb;text-align: center;font-size: 21px;font-weight: 700;' +
            'float: left;padding: 15px 0 0 0;}.dp_week_days_row {width: 100%;height: 30px;position: relative;' +
            'margin: 5px 0;}.dp_week_day_th {position: relative;float: left;height: 100%;width: calc(100% / 7);' +
            'text-align: center;padding: 3px;font-size: 18px;font-weight: 600;}' +
            '.dp_month_days_box {position: relative;width: 100%;height: 200px;}.dp_fake_day, .dp_real_day {' +
            'position: relative;float: left;width: calc(100% / 7);height: 33px;padding: 2px;}' +
            '.dp_inner_day {position: relative;height: 100%;width: 100%;font-size: 15px;font-weight: 600;' +
            'color: #a1a1a1;padding: 3px;border-radius: 3px;border: solid 1px #b2b2b2;cursor: pointer;' +
            'background-color: #f1f1f1;}.dp_inner_day:hover {background-color: #63dbff;color: #ffffff;}' +
            '.dp_current_highlighted_day {background-color: #63dbff;color: #ffffff;}.dp_disabled {' +
            'pointer-events: none;opacity: 0.2 !important;cursor: initial !important;background-color: #f1f1f1 !important;' +
            'color: #a1a1a1 !important;border: solid 1px #b2b2b2 !important;}' +
            '</style>';

        JTS('head').append(pickerStyle);

    }

    return this;

};

JTS.prototype.disabled = function(value?: boolean){

    const t = this;

    if (arguments.length === 1){

        t.attr('disabled', value);

        return t;

    }else{

        return t.attr('disabled');

    }

};

JTS.prototype.dispose = function() {

    const t = this;

    t.each(disposeElement);

    function disposeElement(i, e) {

        JTS(e).offsetPs()[0].removeChild(e);

    }

    return this;

};

JTS.prototype.documentCoordinates = function(left?: any, top?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (arguments.length === 0) {

        return getCoordinates();

    }
    else {

        let flag = true;

        if (arguments[0] != null) {

            if (typeof arguments[0] !== 'number' && typeof arguments[0] !== 'string') {

                console.log('JTS@documentCoordinates not valid parameters list');
                flag = false;

            }

        }

        if (arguments[1]) {

            if (typeof arguments[1] !== 'number' && typeof arguments[1] !== 'string') {

                console.log('JTS@documentCoordinates not valid parameters list');
                flag = false;

            }

        }

        processArguments();

        if ((left && isNaN(left)) || (top && isNaN(top))){

            flag = false;

        }

        if (flag) {

            t.each(assignArguments);

        }

    }

    function processArguments() {

        if (left) {

            if (typeof left === 'string') {

                left = parseFloat(left);

            }

        }

        if (top) {

            if (typeof top === 'string') {

                top = parseFloat(top);

            }

        }

    }

    function assignArguments(i, e) {

        let p = e.offsetParent;

        while (p) {

            if (left || left === 0) {

                left -= p.offsetLeft;

            }

            if (top || top === 0) {

                top -= p.offsetTop;

            }

            p = p.offsetParent;

        }

        if (left || left === 0) {

            left = left + 'px';
            e.style.left = left;

        }
        else {

            e.style.left = e.offsetLeft + 'px';

        }

        if (top || top === 0) {

            top = top + 'px';
            e.style.top = top;

        }
        else {

            e.style.top = e.offsetTop + 'px';

        }

        e.style.position = 'absolute';

    }

    function getCoordinates() {

        const coordinates = t.first().elementGlobalPosition();

        return {

            left: coordinates.x,
            top: coordinates.y

        };

    }

    return this;

};

JTS.prototype.each = function(callback: (i: number , e: any) => void){

    const t = this;

    loop(0);

    function loop(index) {

        if (index < t.length) {

            callback(index, t[index]);
            loop(index + 1);

        }

    }

    return this;

};

JTS.prototype.elementGlobalPosition = function(){

    let parent = this;
    let x = 0;
    let y = 0;

    while (parent[0] !== document && parent[0] !== window){

        if (!parent.hasClass('row')){

            x += parent[0].offsetLeft + parseInt(parent.css('border-left-width'), null);
            y += parent[0].offsetTop + parseInt(parent.css('border-top-width'), null);

        }

        parent = parent.offsetPs();

    }

    return {x , y};

};

JTS.prototype.emits = function(type: string, data: any) {

    const t = this;

    if (!data) {

        data = {};

    }

    JTS.jFlow.jStackIndex = 0;

    executeQuery(JTS.jFlow.jStackIndex);

    function executeQuery(index) {

        if (index < JTS.jFlow.jListeners.length) {

            const l = JTS.jFlow.jListeners[index];

            if (l.type === type) {

                if ((!l.once || l.counter === 0) && !l.executed) {

                    const event = new JTS.jFlow.jEvent(type, t, l.element, data);

                    l.executed = true;

                    l.callback.call(l.element, event);

                    l.counter += 1;

                }

            }

            JTS.jFlow.jStackIndex = index + 1;
            JTS.jFlow.jStackIndex -= JTS.jFlow.unbindIndex;
            JTS.jFlow.unbindIndex = 0;

            if (JTS.jFlow.jStackIndex < 0) {

                JTS.jFlow.jStackIndex = 0;

            }

            executeQuery(JTS.jFlow.jStackIndex);

        }
        else {

            for (const listener of JTS.jFlow.jListeners) {

                listener.executed = false;

            }

        }

    }

    return this;

};

JTS.prototype.even = function() {

    const t = this;

    const e = [];

    t.each(filter);

    function filter(index, element) {

        if ((index + 1) % 2 === 0) {

            e.push(element);

        }

    }

    return JTS(e);

};

JTS.prototype.first = function(){

    const t = this;

    return t.length  > 0 ? JTS(t[0]) : t;

};

JTS.prototype.gearsProgress = function(colorScheme?: any , configuration?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    const GEAR_ONE_SR = 0;
    const GEAR_TWO_SR = 18;
    const GEAR_THREE_SR = 23;
    const ROTATION_VR = 5;

    const colorOne =    colorScheme && colorScheme.gear_one_color ? colorScheme.gear_one_color : '#ff0000';
    const colorTwo =    colorScheme && colorScheme.gear_two_color ? colorScheme.gear_two_color : '#00ff00';
    const colorThree =  colorScheme && colorScheme.gear_three_color ? colorScheme.gear_three_color : '#0000ff';
    const colorBg =     colorScheme && colorScheme.container_color ? colorScheme.container_color : 'rgba(0,0,0,0.8)';
    const progressColor = colorScheme && colorScheme.progress_color ? colorScheme.progress_color : '#ff0000';
    let resizeID = null;
    let inAnimation = true;

    const container = document.createElement('div');
    const gearOne = JTS('<div id="gear_one_jts_gears_progress"><i class="fa fa-cog" style="position:absolute;top:0;left:0;"></i></div>');
    gearOne.css({
        color : colorOne
    });
    const gearTwo = JTS('<div id="gear_two_jts_gears_progress"><i class="fa fa-cog" style="position:absolute;top:0;left:0;"></i></div>');
    gearTwo.css({
        color : colorTwo
    });
    const gearThree = JTS('<div><i class="fa fa-cog" style="position:absolute;top:0;left:0;"></i></div>');
    gearThree.css({
        color : colorThree
    }).attr('id', 'gear_three_jts_gears_progress');

    let gearOneRotation =   GEAR_ONE_SR;
    let gearTwoRotation =   GEAR_TWO_SR;
    let gearThreeRotation = GEAR_THREE_SR;

    addListeners();
    addGraphic();

    function activateProgress(){

        const progressBar = document.createElement('div');

        JTS(progressBar).css({

            height : 50,
            position : 'absolute',
            left : 0,
            bottom : 0,
            'background-color' : progressColor,
            width : 0

        });

        JTS(container).append(progressBar);
        JTS(window).on(JTS.built_in_events.jREQUEST_PROGRESS_EVENT , (e) => {

            const width = 100 * (e.data.original_event.loaded / e.data.original_event.total);
            JTS(progressBar).css('width' , `${width}%`);

        });
        JTS(window).on(JTS.built_in_events.jREQUEST_END_EVENT , (e) => {

            dispose();

        });

        JTS.jRequest( configuration.url , configuration.request_configuration);

    }

    function addGraphic() {

        const css = {

            position: 'fixed',
            left: 0,
            top: 0,
            'z-index': 10000,
            width: '100%',
            height: '100vh',
            'background-color': colorBg,

        };

        gearOne.css('transform', `
                }rotateZ(${GEAR_ONE_SR}deg)`);
        gearTwo.css('transform', `rotateZ(${GEAR_TWO_SR}deg)`);
        gearThree.css('transform', `rotateZ(${GEAR_THREE_SR}deg)`);

        JTS(container).attr('id', 'jts_gears_progress').css(css);
        JTS(container).append(gearOne);
        JTS(container).append(gearTwo);
        JTS(container).append(gearThree);

        setGearsSize();

        JTS('body').append(container);

        if (configuration && configuration.show_progress){

            activateProgress();

        }

        requestAnimationFrame(animateGears);

    }

    function addListeners(){

        JTS(window).bind('resize.jts_gears_progress' , () => {

            clearTimeout(resizeID);

            resizeID = setTimeout(() => setGearsSize() , 100);

        });

    }

    function animateGears() {

        gearOneRotation +=   ROTATION_VR;
        gearTwoRotation -=   ROTATION_VR;
        gearThreeRotation -= ROTATION_VR;

        gearOne.css('transform', `rotateZ(${gearOneRotation}deg)`);
        gearTwo.css('transform', `rotateZ(${gearTwoRotation}deg)`);
        gearThree.css('transform', `rotateZ(${gearThreeRotation}deg)`);

        if (inAnimation) {

            requestAnimationFrame(animateGears);

        }

    }

    function dispose(){

        inAnimation = false;

        JTS(window).unbind('.jts_gears_progress');
        JTS(window).off(JTS.built_in_events.jREQUEST_PROGRESS_EVENT);
        JTS(window).off(JTS.built_in_events.jREQUEST_END_EVENT);

        JTS(container).dispose();

    }

    function getGearsSize(index , width) {

        const INDEX_DELAY = 6;
        const INDEX_T_DELAY = 11;

        const SIZES_SET = [0, 415, 737, 1025, 1981, 10000, 120, 150, 180, 200, 230, 120, 150, 180, 200, 230];

        if (width >= SIZES_SET[index] && width < SIZES_SET[index + 1]) {

            return { gear_size : SIZES_SET[index + INDEX_DELAY] , font_size: SIZES_SET[index + INDEX_T_DELAY]};

        }
        else {

            return getGearsSize(index + 1, width);

        }

    }

    function setGearsSize() {

        const width =  JTS(window).width();
        const height = JTS(window).height();

        const sizes =     getGearsSize(0, width);
        const gear_size = sizes.gear_size;
        const font_size = sizes.font_size;

        const oneLeft =     Math.round((width * 0.5) - (gear_size * 0.89));
        const oneTop =      Math.round((height * 0.5) - (gear_size * 0.5));
        const twoLeft =     Math.round((width * 0.5) - (gear_size * 0.15));
        const twoTop =      Math.round((height * 0.5) - (gear_size * 1.06));
        const threeLeft =   Math.round((width * 0.5) - (gear_size * 0.030));
        const threeTop =    Math.round((height * 0.5) - (gear_size * 0.100));

        const gearCss = {

            width: gear_size,
            height: gear_size,
            position: 'absolute'

        };

        gearOne.css(gearCss).css({ left: oneLeft , top: oneTop, 'font-size': font_size });
        gearTwo.css(gearCss).css({ left: twoLeft , top: twoTop, 'font-size': font_size });
        gearThree.css(gearCss).css({ left: threeLeft, top: threeTop, 'font-size': font_size });

    }

    return t;

};

JTS.prototype.globalToLocalPoint = function(x: number , y: number){

    let parent = this;

    while (parent[0] !== document && parent[0] !== window ){

        if (!parent.hasClass('row')){

            x -= parent[0].offsetLeft;
            y -= parent[0].offsetTop;

        }

        parent = parent.offsetPs();

    }

    return { x , y };

};

JTS.prototype.hasClass = function(classToFind: string): boolean {

    const t = this;

    if (t.length === 0){

        return false;

    }

    const classValue = classToFind.trim().split(' ')[0];
    const oldClass = t[0].getAttribute('class');
    const oldClassArray = oldClass ? oldClass.split(' ') :  [];

    return oldClassArray.indexOf(classValue) !== -1;

};

JTS.prototype.height = function(value?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (t[0] === window) {

        return window.innerHeight;

    }

    if (t[0] === document) {

        return JTS('html').outerHeight();

    }

    if (arguments.length !== 0) {

        t.each((index, element) => {

            const e = JTS(element);
            const box = e.css('box-sizing');

            switch (box) {
                case 'border-box':
                    e.css('height', computeBorder(e));
                    break;
                case 'content-box':
                    e.css('height', value);
                    break;
                case 'padding-box':
                    e.css('height', computePadding(e));
                    break;

            }

        });

    }
    else {

        const e = JTS(t[0]);
        const border = parseFloat(e.css('border-top-width')) + parseFloat(e.css('border-bottom-width'));
        const padding = parseFloat(e.css('padding-top')) + parseFloat(e.css('padding-bottom'));
        return ((t[0].getBoundingClientRect().height - border) - padding);

    }

    function computeBorder(e) {

        const border = parseFloat(e.css('border-top-width')) + parseFloat(e.css('border-bottom-width'));
        const padding = parseFloat(e.css('padding-top')) + parseFloat(e.css('padding-bottom'));
        const gap = border + padding;

        if (typeof value === 'number') {

            return value + gap;

        }
        else {

            const suffix = value.substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) + gap;

            }
            else {

                return 'calc(' + parseFloat(value) + '% + ' + gap + 'px)';

            }

        }

    }

    function computePadding(e) {

        const padding = parseFloat(e.css('padding-top')) + parseFloat(e.css('padding-bottom'));

        if (typeof value === 'number') {

            return value + padding;

        }
        else {

            const suffix = value.substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) + padding;

            }
            else {

                return 'calc(' + parseFloat(value) + '% + ' + padding + 'px)';

            }

        }

    }

    return this;

};

JTS.prototype.hide = function(d?: number, configuration?){

    const t = this;

    const TIME_GAP = 100;

    let property = 'opacity';
    let easing = 'linear';

    if (arguments.length === 0) {

        t.each((i, e) => {

            if (JTS(e).css('display') === 'none' || JTS(e).attr('jts_hidden') || JTS(e).attr('jts_showed')) {

                return;

            }

            JTS.originalStyles.push([e, JTS(e).attr('style')]);

            JTS(e).css('display', 'none');

        });

    }
    else if (arguments.length === 1 && typeof arguments[0] === 'number') {

        t.each(fade);

    }
    else if (arguments.length === 2 && typeof arguments[0] === 'number' && typeof arguments[1] === 'object') {

        property = configuration.method === 'slide' ? 'height' : property;
        easing = configuration.easing ? configuration.easing : easing;

        if (configuration.method === 'fade' || !(configuration.method)) {

            t.each(fade);

        }
        else if (configuration.method === 'slide') {

            t.each(slide);

        }

    }
    else {

        console.log('JTS@hide : wrong arguments list');

    }

    function fade(i, e) {

        if (JTS(e).css('display') === 'none' || JTS(e).attr('jts_hidden') || JTS(e).attr('jts_showed')) {

            return;

        }

        JTS.originalStyles.push([e, JTS(e).attr('style')]);

        JTS(e).attr('jts_hidden', true);

        if (configuration && configuration.startCB) {

            configuration.startCB(i, e);

        }

        let originalStyle = JTS(e).attr('style');
        let style = null;

        if (originalStyle) {

            if (originalStyle.match('opacity:')) {

                style = originalStyle;

            }
            else {
                style = `${originalStyle}opacity:${JTS(e).css('opacity')};`;
            }

        }
        else {

            originalStyle = '';
            style = `opacity:${JTS(e).css('opacity')};`;

        }

        JTS(e).attr('style', style);
        JTS(e).css('transition' , `${property} ${d / 1000}s ${easing} 0s`);

        setTimeout( () => JTS(e).css('opacity', 0) , 1);
        setTimeout(() => {

            if (JTS(e).attr('jts_hidden')) {

                JTS(e).attr('style', originalStyle);
                JTS(e).css('display', 'none');
                e.attributes.removeNamedItem('jts_hidden');

                if (configuration && configuration.endCB) {

                    configuration.endCB(i, e);

                }

            }

        }, d + TIME_GAP);

    }

    function slide(i, e) {

        if (JTS(e).css('display') === 'none' || JTS(e).attr('jts_hidden') || JTS(e).attr('jts_showed')) {

            return;

        }

        JTS.originalStyles.push([e, JTS(e).attr('style')]);

        JTS(e).attr('jts_hidden', true);

        if (configuration && configuration.startCB) {

            configuration.startCB(i, e);

        }

        const wrapper = document.createElement('div');
        const originalStyle = JTS(e).attr('style') || '';

        const parent = JTS(e).offsetPs();

        const wrapperCss = {

            overflow: 'hidden',
            'box-shadow': JTS(e).css('box-shadow'),
            height: JTS(e).outerHeight(),
            width: JTS(e).outerWidth(),
            float: JTS(e).css('float'),
            'margin-left': JTS(e).css('margin-left'),
            'margin-right': JTS(e).css('margin-right'),
            'margin-bottom': JTS(e).css('margin-bottom'),
            'margin-top': JTS(e).css('margin-top'),
            'border-radius': JTS(e).css('border-radius'),
            left: JTS(e).css('left'),
            top: JTS(e).css('top'),
            right: JTS(e).css('right'),
            bottom: JTS(e).css('bottom'),
            position: JTS(e).css('position'),
            'z-index': JTS(e).css('z-index'),
            padding : 0

        };

        const eCss = {

            'margin-left': 0,
            'margin-right': 0,
            'margin-bottom': 0,
            'margin-top': 0,
            'box-shadow': 'none',
            'border-radius': 0,
            width: '100%',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            'z-index': 0

        };

        JTS(wrapper).css(wrapperCss).addClass('jts_hide_wrapper');
        parent.before(wrapper, e);
        JTS(wrapper).append(e);
        JTS(e).css(eCss);
        JTS(wrapper).css('transition', property + ' ' + (d / 1000) + 's ' + easing + ' 0s');

        setTimeout( () => JTS(wrapper).css('height', 0), TIME_GAP * 0.3);
        setTimeout( () => {

            if (JTS(e).attr('jts_hidden')) {

                JTS(e).attr('style', originalStyle);
                JTS(e).css('display', 'none');
                parent.before(e, wrapper);
                parent[0].removeChild(wrapper);
                e.attributes.removeNamedItem('jts_hidden');

                if (configuration && configuration.endCB) {

                    configuration.endCB(i, e);

                }

            }

        }, d + (TIME_GAP * 2));

    }

    return this;

};

JTS.prototype.html = function(content: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (content !== '' && !content) {

        return String(t[0].innerHTML).trim();

    }

    let jTSObject = [];
    const constructor = String(content.constructor);

    if (constructor.match(/\/\*JTS constructor fingerprint\*\//)) {

        jTSObject = content;

    }
    else {

        jTSObject = JTS(content);

    }

    if (jTSObject.length === 0 && constructor.match(/String/)) {

        jTSObject = [];
        parseChildNodes(content);

    }

    if (jTSObject.length === 0 && constructor.match(/Number/)) {

        jTSObject = [];
        parseChildNodes(content.toString());

    }

    if (constructor.match(/Array/)) {

        jTSObject = [];

        for (const item of content) {

            const currentObject = JTS(item);

            if (currentObject.length === 0 && (typeof item === 'string' || typeof item === 'number')) {

                parseChildNodes(item.toString());

            }
            else if (currentObject.length > 0) {

                currentObject.each( (i, e) => jTSObject.push(e));

            }

        }

    }

    function parseChildNodes(val) {

        const canvas = document.createElement('div');

        canvas.innerHTML = val;

        pushElement(0);

        function pushElement(index) {
            if (index < canvas.childNodes.length){
                jTSObject.push(canvas.childNodes[index]);
                pushElement(index + 1);
            }
        }
    }

    t.each(addHTML);

    function addHTML(index, element) {

        element.innerHTML = '';

        for (const item of jTSObject) {

            const clone = item.cloneNode(true);

            element.appendChild(clone);

        }

    }

    return this;

};

JTS.prototype.last = function(){

    const t = this;

    return t.length > 0 ? JTS(t[t.length - 1]) : t;

};

JTS.prototype.load = function(urls: any, success?, error?) {

    const t = this;

    let successCB = null;
    let errorCB = null;
    const responses = [];

    if (arguments.length === 2) {

        if (typeof arguments[1] === 'function') {

            successCB = arguments[1];

        }

    }

    if (arguments.length === 3) {

        if (typeof arguments[1] === 'function') {

            successCB = arguments[1];

        }

        if (typeof arguments[2] === 'function') {

            errorCB = arguments[2];

        }

    }

    if (typeof arguments[0] === 'string') {

        urls = [urls];

    }

    pushResponse(0);
    function pushResponse(index) {

        if (index < urls.length) {

            const r = new XMLHttpRequest();

            r.open('get', urls[index]);

            r.onreadystatechange = () => {

                if (r.readyState === 4) {

                    if (r.status === 200) {

                        const contentType = String(r.getResponseHeader('Content-Type'));

                        if (contentType.indexOf('html') !== -1) {

                            responses.push(r.responseText);
                            pushResponse(index + 1);

                        }
                        else {

                            if (errorCB) {

                                errorCB('JTS@load : load only html files');

                            }

                        }

                    }
                    else {

                        if (errorCB) {

                            errorCB(`JTS@load : server error for index ${index}`);

                        }

                    }

                }

            };

            r.onerror = (e) => {

                if (errorCB) {

                    errorCB(e);

                }

            };

            r.send(null);

        }
        else {

            t.each(displayResponse);

        }

    }

    function displayResponse(i, e) {

        if (responses.length === 1 || i >= responses.length) {

            parseResponse(responses[0], 0);

        }
        else {

            parseResponse(responses[i], i);

        }

        function parseResponse(val, index) {

            e.innerHTML = '';

            const canvas = document.createElement('div');

            canvas.innerHTML = val;

            const counter = canvas.childNodes.length;

            for (let h = 0; h < counter; h++) {

                if (canvas.childNodes[0]) {

                    e.appendChild(canvas.childNodes[0]);

                }

            }

            if (successCB) {

                successCB(responses[index], i, e);

            }

        }

    }

    return this;

};

JTS.prototype.localCoordinates = function(left?: any, top?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (arguments.length === 0) {

        return getCoordinates();

    }
    else {

        let flag = true;

        if (arguments[0] != null) {

            if (typeof arguments[0] !== 'number' && typeof arguments[0] !== 'string') {

                console.log('not-valid-parameters-list @localCoordinates');
                flag = false;

            }

        }

        if (arguments[1]) {

            if (typeof arguments[1] !== 'number' && typeof arguments[1] !== 'string') {

                console.log('not-valid-parameters-list @localCoordinates');
                flag = false;

            }

        }

        processArguments();

        if ((left && isNaN(left)) || (top && isNaN(top))){

            flag = false;

        }

        if (flag) {

            t.each(assignArguments);

        }

    }

    function processArguments() {

        if (left || left === 0) {

            if (typeof left === 'string') {

                left = parseFloat(left);

            }

        }

        if (top || top === 0) {

            if (typeof top === 'string') {

                top = parseFloat(top);

            }

        }

    }

    function assignArguments(i, e) {

        if (left || left === 0) {

            left = left + 'px';
            e.style.left = left;

        }
        else {

            e.style.left = e.offsetLeft + 'px';

        }

        if (top || top === 0) {

            top = top + 'px';
            e.style.top = top;

        }
        else {

            e.style.top = e.offsetTop + 'px';

        }

    }

    function getCoordinates() {

        return {

            left : t[0].offsetLeft,
            top : t[0].offsetTop

        };

    }

    return this;

};

JTS.prototype.masonry = function(windowW?: number, nColumns?: Array<number>, items?: number){

    const t = this;

    if (t.length === 0){

        return t;

    }

    const container = t.offsetPs();
    let initialized = false;
    let containerWidth = 0;
    let columns = 0;
    let currentWidth = 0;
    let columnsHeight = [];
    let orderedItems = null;
    let display = items;

    setElementsWidth();
    init();

    function init(){

        /*Don't know if want to use this function*/
        // updateOrder();

        computeMasonry();
        t.each((i, e) => {

            JTS(e).css({

                position : 'absolute' ,
                transition : 'left 0.5s ease-out , top 0.5s ease-out',
                height : 'auto',

            });

        });
        addListeners();

        if (!initialized){

            initialized = true;
            JTS(window).emits(JTS.built_in_events.jMASONRY_READY);

        }

    }

    function addListeners(){

        JTS(window).bind('resize.jts_masonry_events', (e) => computeMasonry());

        JTS(window).on(JTS.built_in_events.jMASONRY_RESIZE, (e) => {
            if (e.data.display){

                display = e.data.display;

            }

            computeMasonry();

        });

        JTS(window).on(JTS.built_in_events.jEXTERNAL_RESIZE, (e) => computeMasonry());

    }

    function computeMasonry(){

        setElementsWidth();

        columnsHeight = [];

        for (let i = 0; i < columns ; i++){

            columnsHeight[i] = 0;

        }

        t.each((i, e) => {

            if (i === 0){

                currentWidth = JTS(e).outerWidth();

            }

            const x = Math.floor(i % columns) * currentWidth;

            JTS(e).css('left', x).css('top', columnsHeight[Math.floor(i % columns)]);

            if (!display || i < display){

                columnsHeight[Math.floor(i % columns)] +=  Math.floor(JTS(e).outerHeight());

            }

        });

        container.css('height', getColumnHeight());

    }

    function getColumnHeight(){

        let height = 0;

        for (const currentHeight of columnsHeight){

            if (currentHeight > height){

                height = currentHeight;

            }

        }

        return height;

    }

    function getContainerWidth(){

        if (windowW){

            return JTS(window).outerWidth();

        }
        else{
            return container.outerWidth();
        }

    }

    function setElementsWidth(){

        containerWidth =  getContainerWidth();
        columns = containerWidth <= 414 ? 1 : (containerWidth <= 812 ? 2 : (containerWidth <= 1024 ? 3 : 4));

        if (nColumns){
            const optionTwo = containerWidth <= 812 ? nColumns[1] : (containerWidth <= 1024 ? nColumns[2] : nColumns[3]);
            columns = containerWidth <= 414 ? nColumns[0] : optionTwo;
        }

        const width = Math.round(containerWidth / columns);

        t.each((i, e) => {

            const currentParsedWidth = Math.floor(i % columns) === columns - 1 ? containerWidth - (width * Math.floor(i % columns)) : width;

            JTS(e).css('width' , currentParsedWidth);

        });

    }

    function updateOrder() {

        const temporaryArray = [];

        if (!initialized){

            t.each((i, e) => temporaryArray.push(e));

        }
        else{

            for (let i = 0 ; i < orderedItems.length ; i++){

                const random = Math.floor(Math.random() * orderedItems.length);

                temporaryArray.push(orderedItems[random]);
                orderedItems.splice(random, 1);
                i--;

            }

        }

        orderedItems = null;
        orderedItems = JTS(temporaryArray);

    }

    return this;

};

JTS.prototype.mouseDown = function(namespace, handler? , data?){

    const t = this;

    let mouseDownNamespace;
    let mouseDownHandler;
    let mouseDownData;
    const event = JTS.jMobile() ? 'touchstart' : 'mousedown';

    if ((typeof arguments[0]).toLowerCase() === 'string'){

        mouseDownNamespace = '.' + namespace;
        mouseDownHandler = handler;

        if (arguments.length === 3){

            mouseDownData = data;

        }

    }else if ((typeof arguments[0]).toLowerCase() === 'function'){

        mouseDownNamespace = '';
        mouseDownHandler = arguments[0];

        if (arguments.length === 2){

            mouseDownData = arguments[1];

        }

    }

    t.bind(`${event}${mouseDownNamespace}`, mouseDownHandler, mouseDownData);

    return t;

};

JTS.prototype.mouseMove = function(namespace, handler?, data?){

    const t = this;

    let mouseMoveNamespace;
    let mouseMoveHandler;
    let mouseMoveData;
    const event = JTS.jMobile() ? 'touchmove' : 'mousemove';

    if ((typeof arguments[0]).toLowerCase() === 'string'){

        mouseMoveNamespace = '.' + namespace;
        mouseMoveHandler = handler;

        if (arguments.length === 3){

            mouseMoveData = data;

        }

    }else if ((typeof arguments[0]).toLowerCase() === 'function'){

        mouseMoveNamespace = '';
        mouseMoveHandler = arguments[0];

        if (arguments.length === 2){

            mouseMoveData = arguments[1];

        }

    }

    t.bind(`${event}${mouseMoveNamespace}`, mouseMoveHandler, mouseMoveData);

    return t;

};

JTS.prototype.mouseOut = function(namespace, handler?, data?){

    const t = this;

    let mouseOutNamespace;
    let mouseOutHandler;
    let mouseOutData;
    const event = JTS.jMobile() ? 'touchend' : 'mouseout';

    if ((typeof arguments[0]).toLowerCase() === 'string'){

        mouseOutNamespace = '.' + namespace;
        mouseOutHandler = handler;

        if (arguments.length === 3){

            mouseOutData = data;

        }

    }else if ((typeof arguments[0]).toLowerCase() === 'function'){

        mouseOutNamespace = '';
        mouseOutHandler = arguments[0];

        if (arguments.length === 2){

            mouseOutData = arguments[1];

        }

    }

    t.bind(`${event}${mouseOutNamespace}`, mouseOutHandler, mouseOutData);

    return t;

};

JTS.prototype.mouseOver = function(namespace, handler?, data?){

    const t = this;

    let mouseOverNamespace;
    let mouseOverHandler;
    let mouseOverData;
    const event = JTS.jMobile() ? 'touchstart' : 'mouseover';

    if ((typeof arguments[0]).toLowerCase() === 'string'){

        mouseOverNamespace = '.' + namespace;
        mouseOverHandler = handler;

        if (arguments.length === 3){

            mouseOverData = data;

        }

    }else if ((typeof arguments[0]).toLowerCase() === 'function'){

        mouseOverNamespace = '';
        mouseOverHandler = arguments[0];

        if (arguments.length === 2){

            mouseOverData = arguments[1];

        }

    }

    t.bind(`${event}${mouseOverNamespace}`, mouseOverHandler, mouseOverData);

    return t;

};

JTS.prototype.mouseUp = function(namespace, handler?, data?){

    const t = this;

    let mouseUpNamespace;
    let mouseUpHandler;
    let mouseUpData;
    const event = JTS.jMobile() ? 'touchend' : 'mouseup';

    if ((typeof arguments[0]).toLowerCase() === 'string'){

        mouseUpNamespace = '.' + namespace;
        mouseUpHandler = handler;

        if (arguments.length === 3){

            mouseUpData = data;

        }

    }else if ((typeof arguments[0]).toLowerCase() === 'function'){

        mouseUpNamespace = '';
        mouseUpHandler = arguments[0];

        if (arguments.length === 2){

            mouseUpData = arguments[1];

        }

    }

    t.bind(`${event}${mouseUpNamespace}`, mouseUpHandler, mouseUpData);

    return t;

};

JTS.prototype.odd = function() {

    const t = this;

    const e = [];

    t.each(filter);

    function filter(index, element) {

        if ((index + 1) % 2 !== 0) {

            e.push(element);

        }

    }

    return JTS(e);

};

JTS.prototype.off = function(typeOrFamily: string) {

    const t = this;

    let types = '';
    let family = '';
    let isFamily = false;
    let isEvent = false;

    JTS.jFlow.unbindIndex = 0;

    if (typeOrFamily.match(/^\./)) {

        family = typeOrFamily.substring(1);
        isFamily = true;

    }
    else if (typeOrFamily.match(/\w+\.\w+/)) {

        types = typeOrFamily.split('.')[0];
        family = typeOrFamily.split('.')[1];
        isFamily = true;
        isEvent = true;

    }
    else {

        types = typeOrFamily;
        isEvent = true;

    }

    t.each(unbindListener);

    function unbindListener(index, element) {

        if (isFamily && !isEvent) {

            for (let i = 0; i < JTS.jFlow.jListeners.length; i++) {

                const listener = JTS.jFlow.jListeners[i];

                const regExp = '\\s' + listener.surname + '\\s';
                const regExp2 = '\\s' + listener.surname + '$';
                const regExp3 = '^' + listener.surname + '\\s';
                const regExp4 = '^' + listener.surname + '$';

                const checkOne = listener.element === element;
                const subOne = family.match(RegExp(regExp));
                const subTwo = family.match(RegExp(regExp2));
                const subThree  = family.match(RegExp(regExp3));
                const subFour  = family.match(RegExp(regExp4));
                const checkTwo = (subOne || subTwo || subThree || subFour);
                if (checkOne && checkTwo) {

                    JTS.jFlow.jListeners.splice(i, 1);
                    JTS.jFlow.unbindIndex += 1;
                    i -= 1;

                }

            }

        }
        else if (isFamily && isEvent) {

            for (let i = 0; i < JTS.jFlow.jListeners.length; i++) {

                const listener = JTS.jFlow.jListeners[i];

                const regExp = '\\s' + listener.surname + '\\s';
                const regExp2 = '\\s' + listener.surname + '$';
                const regExp3 = '^' + listener.surname + '\\s';
                const regExp4 = '^' + listener.surname + '$';
                const regExp5 = '\\s' + listener.type + '\\s';
                const regExp6 = '\\s' + listener.type + '$';
                const regExp7 = '^' + listener.type + '\\s';
                const regExp8 = '^' + listener.type + '$';

                const checkOne = listener.element === element;
                const subOne = family.match(RegExp(regExp));
                const subTwo = family.match(RegExp(regExp2));
                const subThree  = family.match(RegExp(regExp3));
                const subFour  = family.match(RegExp(regExp4));
                const checkTwo = (subOne || subTwo || subThree || subFour);
                const subFive = family.match(RegExp(regExp5));
                const subSix = family.match(RegExp(regExp6));
                const subSeven  = family.match(RegExp(regExp7));
                const subEight  = family.match(RegExp(regExp8));
                const checkThree = (subFive || subSix || subSeven || subEight);

                if (checkOne && checkTwo && checkThree) {

                    JTS.jFlow.jListeners.splice(i, 1);
                    JTS.jFlow.unbindIndex += 1;
                    i -= 1;

                }

            }

        }
        else if (isEvent && !isFamily) {

            for (let i = 0; i < JTS.jFlow.jListeners.length; i++) {

                const listener = JTS.jFlow.jListeners[i];

                const regExp = '\\s' + listener.type + '\\s';
                const regExp2 = '\\s' + listener.type + '$';
                const regExp3 = '^' + listener.type + '\\s';
                const regExp4 = '^' + listener.type + '$';

                const checkOne = listener.element === element;
                const subOne = family.match(RegExp(regExp));
                const subTwo = family.match(RegExp(regExp2));
                const subThree  = family.match(RegExp(regExp3));
                const subFour  = family.match(RegExp(regExp4));
                const checkTwo = (subOne || subTwo || subThree || subFour);

                if (checkOne && checkTwo) {

                    JTS.jFlow.jListeners.splice(i, 1);
                    JTS.jFlow.unbindIndex += 1;
                    i -= 1;

                }

            }

        }

    }

    return this;

};

JTS.prototype.offsetPs = function() {

    const t = this;

    const jTSObject = [];

    t.each((i, e) => {

        let flag = false;

        const parent = e === document.querySelector('body') ? document.querySelector('html') : e.parentNode;

        if (parent == null) {

            flag = true;

        }

        for (const element of jTSObject){

            if (element === parent) {

                flag = true;
                break;

            }
        }

        if (!flag) {

            jTSObject.push(parent);

        }

    });

    return JTS(jTSObject);

};

JTS.prototype.on = function(type: string, callback) {

    const t = this;

    const typesAndNamespaces = type.split('.');
    const types = typesAndNamespaces[0].split(' ');
    const namespace = typesAndNamespaces.length > 1 ? typesAndNamespaces[1] : 'none';

    t.each(addListener);

    function addListener(i, e) {

        for (const tp of types) {

            const l = {

                type: tp,
                callback,
                namespace,
                element: e,
                once: false,
                counter: 0,
                executed: false

            };

            JTS.jFlow.jListeners.push(l);

        }

    }

    return this;

};

JTS.prototype.once = function(type, callback) {

    const t = this;

    const typesAndNamespace = type.split('.');
    const types = typesAndNamespace[0].split(' ');
    const namespace = typesAndNamespace.length > 1 ? typesAndNamespace[1] : 'none';

    t.each(addListener);

    function addListener(i, e) {

        for (const name of types.length) {

            const l = {

                type : name,
                callback,
                namespace,
                element: e,
                once: true,
                counter: 0,
                executed: false

            };

            JTS.jFlow.jListeners.push(l);

        }

    }

    return this;

};

JTS.prototype.outerHeight = function(valueOrMargin?) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (t[0] === window) {

        return window.innerHeight;

    }

    if (t[0] === document) {

        return JTS('html').outerHeight();

    }

    if (arguments.length !== 0) {

        if (typeof arguments[0] === 'boolean') {

            const e = JTS(t[0]);
            const marginHeight = valueOrMargin ? parseFloat(e.css('margin-top')) + parseFloat(e.css('margin-bottom')) : 0;

            return t[0].getBoundingClientRect().height + marginHeight;

        }
        else {

            t.each((index, element) => {

                const e = JTS(element);
                const box = e.css('box-sizing');

                switch (box) {
                    case 'border-box':
                        e.css('height', valueOrMargin);
                        break;
                    case 'content-box':
                        e.css('height', computeContent(e));
                        break;
                    case 'padding-box':
                        e.css('height', computePadding(e));
                        break;

                }

            });

        }

    }
    else {

        return t[0].getBoundingClientRect().height;

    }

    function computeContent(e) {

        const border = parseFloat(e.css('border-top-width')) + parseFloat(e.css('border-bottom-width'));
        const padding = parseFloat(e.css('padding-top')) + parseFloat(e.css('padding-bottom'));
        const gap = border + padding;

        if (typeof valueOrMargin === 'number') {

            return valueOrMargin - gap;

        }
        else {

            const suffix = valueOrMargin.substring(valueOrMargin.length - 1);

            if (suffix === 'x') {

                return parseFloat(valueOrMargin) - gap;

            }
            else {

                return 'calc(' + parseFloat(valueOrMargin) + '% - ' + gap + 'px)';

            }

        }

    }

    function computePadding(e) {

        const border = parseFloat(e.css('border-top-width')) + parseFloat(e.css('border-bottom-width'));

        if (typeof valueOrMargin === 'number') {

            return valueOrMargin - border;

        }
        else {

            const suffix = valueOrMargin.substring(valueOrMargin.length - 1);

            if (suffix === 'x') {

                return parseFloat(valueOrMargin) - border;

            }
            else {

                return 'calc(' + parseFloat(valueOrMargin) + '% - ' + border + 'px)';

            }

        }

    }

    return this;

};

JTS.prototype.outerWidth = function(valueOrMargin?) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (t[0] === window) {

        return window.innerWidth;

    }

    if (t[0] === document) {

        return JTS('html').outerWidth();

    }

    if (arguments.length !== 0) {

        if (typeof arguments[0] === 'boolean') {

            const e = JTS(t[0]);
            const marginWidth = valueOrMargin ? parseFloat(e.css('margin-left')) + parseFloat(e.css('margin-right')) : 0;

            return t[0].getBoundingClientRect().width + marginWidth;

        }
        else {

            t.each((index, element) => {

                const e = JTS(element);
                const box = e.css('box-sizing');

                switch (box) {
                    case 'border-box':
                        e.css('width', valueOrMargin);
                        break;
                    case 'content-box':
                        e.css('width', computeContent(e));
                        break;
                    case 'padding-box':
                        e.css('width', computePadding(e));
                        break;

                }

            });

        }

    }
    else {

        return t[0].getBoundingClientRect().width;

    }

    function computeContent(e) {

        const border = parseFloat(e.css('border-left-width')) + parseFloat(e.css('border-right-width'));
        const padding = parseFloat(e.css('padding-left')) + parseFloat(e.css('padding-right'));
        const gap = border + padding;

        if (typeof valueOrMargin === 'number') {

            return valueOrMargin - gap;

        }
        else {

            const suffix = valueOrMargin.substring(valueOrMargin.length - 1);

            if (suffix === 'x') {

                return parseFloat(valueOrMargin) - gap;

            }
            else {

                return 'calc(' + parseFloat(valueOrMargin) + '% - ' + gap + 'px)';

            }

        }

    }

    function computePadding(e) {

        const border = parseFloat(e.css('border-left-width')) + parseFloat(e.css('border-right-width'));

        if (typeof valueOrMargin === 'number') {

            return valueOrMargin - border;

        }
        else {

            const suffix = valueOrMargin.substring(valueOrMargin.length - 1);

            if (suffix === 'x') {

                return parseFloat(valueOrMargin) - border;

            }
            else {

                return 'calc(' + parseFloat(valueOrMargin) + '% - ' + border + 'px)';

            }

        }

    }

    return this;

};

JTS.prototype.paddingHeight = function(value?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (t[0] === window) {

        return window.innerHeight;

    }

    if (t[0] === document) {

        return JTS('html').outerHeight();

    }

    if (arguments.length !== 0) {

        t.each( (index, element) => {

            const e = JTS(element);
            const box = e.css('box-sizing');

            switch (box) {
                case 'border-box':
                    e.css('height', computeBorder(e));
                    break;
                case 'content-box':
                    e.css('height', computeContent(e));
                    break;
                case 'padding-box':
                    e.css('height', value);
                    break;

            }

        });

    }
    else {

        const e = JTS(t[0]);
        const border = parseFloat(e.css('border-top-width')) + parseFloat(e.css('border-bottom-width'));
        return t[0].getBoundingClientRect().height - border;

    }

    function computeBorder(e) {

        const border = parseFloat(e.css('border-top-width')) + parseFloat(e.css('border-bottom-width'));

        if (typeof value === 'number') {

            return value + border;

        }
        else {

            const suffix = value.substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) + border;

            }
            else {

                return 'calc(' + parseFloat(value) + '% + ' + border + 'px)';

            }

        }

    }

    function computeContent(e) {

        const padding = parseFloat(e.css('padding-top')) + parseFloat(e.css('padding-bottom'));

        if (typeof value === 'number') {

            return value - padding;

        }
        else {

            const suffix = value.substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) - padding;

            }
            else {

                return 'calc(' + parseFloat(value) + '% - ' + padding + 'px)';

            }

        }

    }

    return this;

};

JTS.prototype.paddingWidth = function(value?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (t[0] === window) {

        return window.innerWidth;

    }

    if (t[0] === document) {

        return JTS('html').outerWidth();

    }

    if (arguments.length !== 0) {

        t.each((index, element) => {

            const e = JTS(element);
            const box = e.css('box-sizing');

            switch (box) {
                case 'border-box':
                    e.css('width', computeBorder(e));
                    break;
                case 'content-box':
                    e.css('width', computeContent(e));
                    break;
                case 'padding-box':
                    e.css('width', value);
                    break;

            }

        });

    }
    else {

        const e = JTS(t[0]);
        const border = parseFloat(e.css('border-left-width')) + parseFloat(e.css('border-right-width'));
        return t[0].getBoundingClientRect().width - border;

    }

    function computeBorder(e) {

        const border = parseFloat(e.css('border-left-width')) + parseFloat(e.css('border-right-width'));

        if (typeof value === 'number') {

            return value + border;

        }
        else {

            const suffix = value.substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) + border;

            }
            else {

                return 'calc(' + parseFloat(value) + '% + ' + border + 'px)';

            }

        }

    }

    function computeContent(e) {

        const padding = parseFloat(e.css('padding-left')) + parseFloat(e.css('padding-right'));

        if (typeof value === 'number') {

            return value - padding;

        }
        else {

            const suffix = value.substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) - padding;

            }
            else {

                return 'calc(' + parseFloat(value) + '% - ' + padding + 'px)';

            }

        }

    }

    return this;

};

JTS.prototype.pagination = /*jTS*/function(itemsToShow: number, configuration?){

    let t = this;

    if (t.length === 0){

        return this;

    }

    let pageSize = itemsToShow;
    const container = t.offsetPs();
    const interfaceContainer = configuration && configuration.interfaceParent ? JTS(configuration.interfaceParent) : container;
    let pages = Math.ceil(t.length / pageSize);
    let startIndex = 0;
    let pageIndex = 0;
    let interfaceBox = null;

    addStyles();
    displayItems();
    addInterface();
    updateInterface();

    JTS(window).emits(JTS.built_in_events.jPAGINATION_PAGE_CHANGE, {

        items_displayed : itemsToShow,
        page_index : pageIndex + 1,
        total_pages : pages

    });


    JTS(window).on(JTS.built_in_events.jPAGINATION_UPDATE_ITEMS, updateItemsToShow);
    JTS(window).on(JTS.built_in_events.jPAGINATION_FILTER_SORT_ITEMS, filterSortItems);

    function addInterface(){

        const interfaceBoxClass = configuration && configuration.interface_box_class ? configuration.interface_box_class : '';
        const previousNextButtonClass = configuration && configuration.previous_next_page_class ? configuration.previous_next_page_class : '';
        const pageButtonClass = configuration && configuration.page_button_class ? configuration.page_button_class : '';
        const previousLabel = configuration && configuration.previous_label ? configuration.previous_label : 'PREVIOUS';
        const nextLabel = configuration && configuration.next_label ? configuration.next_label : 'NEXT';

        interfaceBox = JTS('<div class="jts_pagination_interface_box_class ' + interfaceBoxClass  + '"></div>');
        const previousButton = JTS('<div class="jts_pagination_previous_next_button_class ' + previousNextButtonClass  + '" id="jts_pagination_previous_button">' + previousLabel + '</div>');
        const nextButton = JTS('<div class="jts_pagination_previous_next_button_class ' +  previousNextButtonClass + '" id="jts_pagination_next_button">' + nextLabel + '</div>');

        interfaceBox.append(previousButton);

        for (let i = 0; i < pages ; i++){

            interfaceBox.append(`<div class="jts_pagination_page_button ${pageButtonClass}" data-index_ref="${i}">${(i + 1)}</div>`);

        }

        interfaceBox.append(nextButton);
        interfaceContainer.append(interfaceBox);

        addListeners();

    }

    function addListeners() {

        JTS('#jts_pagination_previous_button').bind('click.jts_pagination_events', (e) => goToPreviousPage());

        JTS('#jts_pagination_next_button').bind('click.jts_pagination_events', (e) => goToNextPage());

        JTS('.jts_pagination_page_button')
            .bind('click.jts_pagination_events', (e) => goToPage(parseInt(JTS(this).attr('data-index_ref'), null)));

    }

    function addStyles(){

        const interfaceBoxClass = configuration && configuration.interface_box_class ? '' : '.jts_pagination_interface_box_class{' +
            'width:100%!important;display:block!important;position:relative!important;height:auto!important;padding:15px!important;float:left!important;}';

        const previousNextButtonClass = configuration && configuration.previous_next_page_class ? '' : '.jts_pagination_previous_next_button_class{' +
            'width:150px!important;display:block!important;position:relative!important;height:50px!important;padding:13px 5px 0px 5px!important;font-size:20px!important;font-weight:700!important;' +
            'color:#bebebe!important;border:solid 1px #bebebe!important;background-color:#ffffff!important;cursor:pointer!important;font-family:Helvetica!important;' +
            'margin:5px 10px!important;float:left!important;text-align:center!important;}' +
            '.jts_pagination_previous_next_button_class:hover{background-color:#000000!important;color:#ffffff!important;border-color:#ffffff!important;}' +
            '.jts_pagination_previous_next_button_class[active]{box-shadow:2px 2px 5px 0px rgba(0,0,0,0.5)!important;background-color:#000000!important;color:#ffffff!important;border-color:#ffffff!important;}' +
            '.jts_pagination_previous_next_button_class[disabled]{opacity:0.3!important;pointer-events:none!important;}';

        const pageButtonClass = configuration && configuration.page_button_class ? '' : '.jts_pagination_page_button{' +
            'width:50px!important;display:block!important;position:relative!important;height:50px!important;padding:13px 5px 0px 5px!important;font-size:20px!important;font-weight:700!important;' +
            'color:#bebebe!important;border:solid 1px #bebebe!important;background-color:#ffffff!important;cursor:pointer!important;font-family:Helvetica!important;' +
            'margin:5px 10px!important;float:left!important;text-align:center!important;}' + '.jts_pagination_page_button:hover{background-color:#000000!important;color:#ffffff!important;border-color:#ffffff!important;}' +
            '.jts_pagination_page_button[active]{box-shadow:2px 2px 5px 0px rgba(0,0,0,0.5)!important;background-color:#000000!important;color:#ffffff!important;border-color:#ffffff!important;}';

        const paginationStyle = '<style id="jts_pagination_style" type="text/css">' +
            interfaceBoxClass +
            previousNextButtonClass +
            pageButtonClass +
            '</style>';

        JTS('head').append(paginationStyle);

    }

    function clearContainer() {

        container.html('');

    }

    function displayItems() {

        clearContainer();

        const lastIndex = startIndex + pageSize;
        for (let index = startIndex ; index < t.length && index < lastIndex; index++){

            container.append(t[index]);

        }

        if (interfaceBox != null){

            interfaceContainer.append(interfaceBox);

        }

    }

    function goToNextPage(){

        pageIndex = pageIndex + 1;
        startIndex = pageIndex * pageSize;
        displayItems();
        updateInterface();
        JTS(window).emits(JTS.built_in_events.jPAGINATION_PAGE_CHANGE, {

            items_displayed : itemsToShow,
            page_index : pageIndex + 1,
            total_pages : pages

        });

    }

    function goToPage(index){

        pageIndex = index;
        startIndex = pageIndex * pageSize;
        displayItems();
        updateInterface();
        JTS(window).emits(JTS.built_in_events.jPAGINATION_PAGE_CHANGE, {

            items_displayed : itemsToShow,
            page_index : pageIndex + 1,
            total_pages : pages

        });

    }

    function goToPreviousPage(){

        pageIndex = pageIndex - 1;
        startIndex = pageIndex * pageSize;
        displayItems();
        updateInterface();
        JTS(window).emits(JTS.built_in_events.jPAGINATION_PAGE_CHANGE, {

            items_displayed : itemsToShow,
            page_index : pageIndex + 1,
            total_pages : pages

        });

    }

    function removeListeners(){

        JTS('#jts_pagination_previous_button').unbind('click');

        JTS('#jts_pagination_next_button').unbind('click');

        JTS('.jts_pagination_page_button').unbind('click');

    }

    function resetInterface(){

        removeListeners();
        interfaceContainer.html('');
        addInterface();

    }

    function filterSortItems(e){

        t = e.data.filtered_sorted_items;

        startIndex = 0;
        pageIndex = 0;
        pages = Math.ceil(t.length / pageSize);
        displayItems();
        resetInterface();
        updateInterface();

        JTS(window).emits(JTS.built_in_events.jPAGINATION_PAGE_CHANGE, {

            items_displayed : itemsToShow,
            page_index : pageIndex + 1,
            total_pages : pages

        });

    }

    function updateInterface(){

        if (pages === 1 || pageIndex === 0 || t.length === 0){

            JTS('#jts_pagination_previous_button').attr('disabled', true);

        }else{

            JTS('#jts_pagination_previous_button').attr('disabled', false);

        }

        JTS('.jts_pagination_page_button').attr('active', false);
        JTS('.jts_pagination_page_button[data-index_ref="' + pageIndex + '"]').attr('active', true);

        if (pages === 1 || pageIndex === pages - 1 || t.length === 0){

            JTS('#jts_pagination_next_button').attr('disabled', true);

        }else{

            JTS('#jts_pagination_next_button').attr('disabled', false);

        }


    }

    function updateItemsToShow(e){

        pageSize = e.data.items_displayed;
        startIndex = 0;
        pageIndex = 0;
        pages = Math.ceil(t.length / pageSize);
        displayItems();
        resetInterface();
        updateInterface();

        JTS(window).emits(JTS.built_in_events.jPAGINATION_PAGE_CHANGE, {

            items_displayed : itemsToShow,
            page_index : pageIndex + 1,
            total_pages : pages

        });

    }

    return this;

};

JTS.prototype.particlesFX = function(configuration?: any){

    const t = this;

    // Function is designed for one canvas at time
    if (t.length !== 1 || t[0].tagName.toLowerCase() !== 'canvas'){

        return t;

    }

    // Device pixel ratio
    const ratio = window.devicePixelRatio || 1;

    // Constants
    const PARTICLES_NUMBER = configuration && configuration.particles_number ? configuration.particles_number : [150, 80, 50];
    const PARTICLE_SIZE = configuration && configuration.particles_size ? configuration.particles_size : 15;
    const PARTICLE_MIN_SIZE = configuration && configuration.particles_min_size ? configuration.particles_min_size : 5;
    const FRAME_RATE = 16;
    const VELOCITY = 2 * ratio;
    const VELOCITY_SCALE = 1;
    const BOUNDARY_GAP = 30 * ratio;

    const a = configuration.minimum_distance;
    const b = configuration.pointer_minimum_distance;
    const MINIMUM_DISTANCE = configuration && a ? a * a : 150 * 150;
    const POINTER_MINIMUM_DISTANCE = configuration && b ? b * b : 180 * 180;
    const POINTER_MINIMUM_DISTANCE_ROOT_SQUARE = configuration && b ? b : 180;
    const MEDIUM_SCREEN_SIZE = 736;
    const SMALL_SCREEN_SIZE = 414;
    const RESIZE_DELAY = 100;

    // general variables;
    const canvas = t[0];
    const container = t.offsetPs();
    const brush = canvas.getContext('2d');

    let particles = [];
    let stageWidth = 0;
    let stageHeight = 0;
    let pointerActive = false;
    let pointerX = 0;
    let pointerY = 0;
    let resizeID = null;

    // The Particle Object Class
    Particle.prototype = Object.create({});
    Particle.prototype.constructor = Particle;

    function Particle(x, y, size){

        this.x = x;
        this.y = y;
        this.size = size;

        // Set particle velocity
        this.vX = VELOCITY * ((Math.random() * (VELOCITY_SCALE - -VELOCITY_SCALE)) + -VELOCITY_SCALE);
        this.vY = VELOCITY * ((Math.random() * (VELOCITY_SCALE - -VELOCITY_SCALE)) + -VELOCITY_SCALE);

    }

    Particle.prototype.update = function(pX , pY){

        // Update particle position
        this.x += this.vX;
        this.y += this.vY;

        // Check if particle is out of boundaries
        if (this.x < 0 - BOUNDARY_GAP || this.x > stageWidth + BOUNDARY_GAP){

            this.x = this.x < 0 ? stageWidth + BOUNDARY_GAP : 0 - BOUNDARY_GAP;

        }

        if (this.y < 0 - BOUNDARY_GAP || this.y > stageHeight + BOUNDARY_GAP){

            this.y = this.y < 0 ? stageHeight + BOUNDARY_GAP : 0 - BOUNDARY_GAP;

        }

        // Check pointer interaction
        const dX = pX - this.x;
        const dY = pY - this.y;
        const distance = dX * dX + dY * dY;

        if (distance < POINTER_MINIMUM_DISTANCE  && pointerActive){

            const radians = Math.atan2(dY, dX);

            this.x = pX - (POINTER_MINIMUM_DISTANCE_ROOT_SQUARE * Math.cos(radians));
            this.y = pY - (POINTER_MINIMUM_DISTANCE_ROOT_SQUARE * Math.sin(radians));

        }

    };

    setSize();
    init();
    addListeners();
    animate();

    JTS(canvas).emits(JTS.built_in_events.jPARTICLES_FX_READY);

    function addListeners(){

        JTS(window).bind('resize.jts_particles_fx_events', () => {

            clearTimeout(resizeID);

            resizeID = setTimeout(() => {

                setSize();
                init();

            }, RESIZE_DELAY);

        }).bind('mousemove.jts_particles_fx_events', (e) => {

            const pointerLocalCoordinates = getPointerLocalCoordinates(e.globalX, e.globalY);

            pointerX = pointerLocalCoordinates.x;
            pointerY = pointerLocalCoordinates.y;

        });

        JTS(canvas).bind('mouseover.jts_particles_fx_events', (e) => {

            pointerActive = true;

        }).bind('mouseout.jts_particles_fx_events', (e) => {

            pointerActive = false;

        });

    }

    function animate(){

        // Clear the stage
        const configColor = configuration.color;
        const rB = 'rgba(207,207,207,0.5)';

        brush.clearRect(0, 0, stageWidth, stageHeight);
        brush.fillStyle = configuration && configColor ? (`rgba(${configColor[0]},${configColor[1]},${configColor[2]},0.5)`) : rB;

        for (let i = 0; i < particles.length; i++){

            const particle = particles[i];

            // Draw particle
            brush.beginPath();
            brush.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
            brush.closePath();
            brush.fill();

            for (let l = i + 1 ; l < particles.length; l++){

                const other = particles[l];

                const dX = other.x - particle.x;
                const dY = other.y - particle.y;
                const distance = dX * dX + dY * dY;

                // If two particles are close enough draw connection line
                if (distance < (MINIMUM_DISTANCE * ratio)){

                    const styleData = getBrushStyle(distance);

                    brush.lineWidth = styleData.lineWidth;
                    brush.strokeStyle = configuration && configColor ? ('rgba(' + configuration.color[0] + ',' + configuration.color[1] + ',' + configuration.color[2] + ',' + styleData.opacity + ')') : 'rgba(207,207,207,' + styleData.opacity + ')';

                    brush.beginPath();
                    brush.moveTo(particle.x, particle.y);
                    brush.lineTo(other.x, other.y);
                    brush.closePath();
                    brush.stroke();

                }

            }

            // Update particle position for new frame
            particle.update(pointerX, pointerY);

        }

        setTimeout(() => {

            animate();

        }, FRAME_RATE);

    }

    function getBrushStyle(distance){

        let opacity = '0';
        let lineWidth = 0;

        if (distance >= (MINIMUM_DISTANCE * ratio) * 0.8){

            opacity = '0.1';
            lineWidth = 0.2;

        }
        else if (distance < (MINIMUM_DISTANCE * ratio) * 0.8 && distance >= (MINIMUM_DISTANCE * ratio) * 0.6){

            opacity = '0.2';
            lineWidth = 0.3;

        }
        else if (distance < (MINIMUM_DISTANCE * ratio) * 0.6 && distance >= (MINIMUM_DISTANCE * ratio) * 0.4){

            opacity = '0.3';
            lineWidth = 0.4;

        }
        else if (distance < (MINIMUM_DISTANCE * ratio) * 0.4 && distance >= (MINIMUM_DISTANCE * ratio) * 0.2){

            opacity = '0.4';
            lineWidth = 0.4;

        }
        else{

            opacity = '0.5';
            lineWidth = 0.5;

        }

        return { opacity, lineWidth : lineWidth * ratio};

    }

    function getParticleSize(startSize){

        startSize = startSize * ratio;

        const random = Math.ceil(Math.random() * startSize);
        let size = random - Math.floor(Math.random() * (startSize * 0.5));

        size = size  < (PARTICLE_MIN_SIZE * ratio) ? (PARTICLE_MIN_SIZE * ratio) : size;

        return size;

    }

    function getPointerLocalCoordinates(x, y){

        let parent = canvas;

        while (parent){

            x -= parent.offsetLeft;
            y -= parent.offsetTop;

            parent = parent.offsetParent;

        }

        return {x : x * ratio, y : y * ratio};

    }

    function init(){

        makeParticle(0);

        // This make a new particle
        function makeParticle(index){

            // How many particles based on stage size
            const numberIndex = container.outerWidth() > MEDIUM_SCREEN_SIZE ? 0 : (container.outerWidth() <= SMALL_SCREEN_SIZE ? 2 : 1 );

            if (index < PARTICLES_NUMBER[numberIndex]){

                const particle = new Particle(Math.random() * stageWidth , Math.random() * stageHeight , getParticleSize(PARTICLE_SIZE));

                particles.push(particle);
                makeParticle(index + 1);

            }

        }

    }

    function setSize(){

        // Reset particles if necessary
        particles = [];

        // Reset stage size
        if (container != null){

            stageWidth =  container.outerWidth();
            stageHeight = container.outerHeight();

        }
        else{

            stageWidth =  JTS(window).outerWidth();
            stageHeight = JTS(window).outerHeight();

        }

        stageWidth = stageWidth * ratio;
        stageHeight = stageHeight * ratio;

        canvas.width = stageWidth;
        canvas.height = stageHeight;

    }

    return this;

};

JTS.prototype.raw = function(n: number){

    const t = this;

    const a = arguments.length === 0;
    const b = typeof arguments[0] !== 'number';
    if (a || b || parseInt(n.toString(), null) < 0 || parseInt(n.toString(), null) > t.length - 1){
        return t;
    }

    return t[parseInt(n.toString(), null)];

};

JTS.prototype.removeClass = function(classToRemove: string) {

    const t = this;

    const classToRemoveArray = classToRemove.trim().split(' ');

    t.each(rValue);

    function rValue(i, e) {

        const oldClass = e.getAttribute('class');
        const oldClassArray = oldClass ? oldClass.split(' ') : [];

        for (const name of classToRemoveArray){

            const classToR = name.trim();

            if (oldClassArray.indexOf(classToR) !== -1){

                oldClassArray.splice(oldClassArray.indexOf(classToR), 1);

            }

        }

        e.setAttribute('class', oldClassArray.join(' ').trim());

    }

    return this;

};

JTS.prototype.screenCoordinates = function(left?: any , top?: any) {

    const t = this;

    if ( t.length === 0){

        return t;

    }

    const pageOffset = getPageOffset();

    if (arguments.length === 0) {

        return getCoordinates();

    }
    else {

        let flag = true;

        if (arguments[0] != null) {

            if (typeof arguments[0] !== 'number' && typeof arguments[0] !== 'string') {

                console.log('JTS@screenCoordinates : not valid parameters list');
                flag = false;

            }

        }

        if (arguments[1]) {

            if (typeof arguments[1] !== 'number' && typeof arguments[1] !== 'string') {

                console.log('JTS@screenCoordinates : not valid parameters list');
                flag = false;

            }

        }

        processArguments();

        if ((left && isNaN(left)) || (top && isNaN(top))){

            flag = false;

        }

        if (flag) {

            t.each(assignArguments);

        }

    }

    function assignArguments(i, e) {

        let p = e.offsetParent;

        while (p) {

            if (left || left === 0) {

                left -= p.offsetLeft;

            }

            if (top || top === 0) {

                top -= p.offsetTop;

            }

            p = p.offsetParent;

        }

        if (left ||  left === 0) {

            left += pageOffset.x;
            left = left + 'px';
            e.style.left = left;

        }
        else {

            e.style.left = e.offsetLeft + 'px';

        }

        if (top || top === 0) {

            top += pageOffset.y;
            top = top + 'px';
            e.style.top = top;

        }
        else {

            e.style.top = e.offsetTop + 'px';

        }

        e.style.position = 'absolute';

    }

    function getCoordinates() {

        const coordinates = t.first().elementGlobalPosition();

        return {

            left : coordinates.x - pageOffset.x,
            top : coordinates.y - pageOffset.y

        };

    }

    function getPageOffset() {

        const w = window;
        const d = document;

        const scrollX = w.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
        const scrollY = w.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;

        return { x : scrollX, y : scrollY };

    }

    function processArguments() {

        if (left || left === 0) {

            if (typeof left === 'string') {

                left = parseFloat(left);

            }

        }

        if (top || top === 0) {

            if (typeof top === 'string') {

                top = parseFloat(top);

            }

        }

    }

    return this;

};

JTS.prototype.scroll = function(namespace , handler?, data?){

    const t = this;

    let scrollNamespace;
    let scrollHandler;
    let scrollData;
    const event = JTS.jMobile() ? 'touchmove' : 'mousewheel DOMMouseScroll MozMousePixelScroll';

    if ((typeof arguments[0]).toLowerCase() === 'string'){

        scrollNamespace = '.' + namespace;
        scrollHandler = handler;

        if (arguments.length === 3){

            scrollData = data;

        }

    }else if ((typeof arguments[0]).toLowerCase() === 'function'){

        scrollNamespace = '';
        scrollHandler = arguments[0];

        if (arguments.length === 2){

            scrollData = arguments[1];

        }

    }

    t.bind(`${event}${scrollNamespace}`, scrollHandler, scrollData);
    t.each((i, e) => {

        e.onscroll = scrollHandler;

    });

    return t;

};

JTS.prototype.scrollingLiquidBox = function(isLiquid: boolean , configuration?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    const onMobile =      JTS.jMobile();
    const boxID =         new Date().getTime() + '_' + Math.floor(Math.random() * 500);
    const container =     t[0];
    const slidingBox =    document.createElement('div');
    const scrollMarker =  document.createElement('div');
    let onNoScroll =    false;
    let inSliding =     false;
    let alreadyLiquid = false;
    let size =          false;
    let currentY =      0;

    let previousContainerX = 0;
    let previousContainerY = 0;

    let previousContainerWidth;
    let previousContainerHeight;
    let previousParentWidth;
    let previousParentHeight;
    let previousSlidingBoxHeight;

    const liquidHandlesArray = [];

    const mousedown = onMobile ? 'touchstart' : 'mousedown';
    const mouseover = onMobile ? 'touchstart' : 'mouseover';
    const mousemove = onMobile ? 'touchmove' : 'mousemove';
    const mouseout =  onMobile ? 'touchend' : 'mouseout';
    const mouseup =   onMobile ? 'touchend' : 'mouseup';

    const slidingBoxCSS = {

        position : 'absolute',
        padding  : configuration && configuration.padding ? configuration.padding : 0,
        height   : 'auto',
        width    : '100%',
        top     : 0,
        left     : 0,
        'z-index'  : 3

    };

    const scrollMarkerCss = {

        position           : 'absolute',
        right              : 0,
        top                : 0,
        width              : configuration && configuration.scroll_marker_width ? configuration.scroll_marker_width : 20,
        'box-shadow'       : configuration && configuration.scroll_marker_shadow ? configuration.scroll_marker_shadow : '-5px 5px 5px 0px rgba(0, 0, 0, 0.3)',
        'background-color' : configuration && configuration.scroll_marker_background ? configuration.scroll_marker_background : '#0eb7da',
        'border-radius'    : configuration && configuration.scroll_marker_radius ? configuration.scroll_marker_radius : 5,
        cursor             : 'pointer',
        'z-index'          : 15

    };

    liquid();

    function addLiquidFunctions() {

        const MINIMUM_SIZE = 100;

        const containerWidth =  JTS(container).outerWidth();
        const containerHeight = JTS(container).outerHeight();

        let parentBorderSizeX = parseInt(JTS(container).offsetPs().css('border-left-width'), null);
        let parentBorderSizeY = parseInt(JTS(container).offsetPs().css('border-top-width'), null);
        const parentBoxSizing =   JTS(container).offsetPs().css('box-sizing');

        parentBorderSizeX = parentBorderSizeX ? parentBorderSizeX : 0;
        parentBorderSizeY = parentBorderSizeX ? parentBorderSizeY : 0;

        const nameSet = ['lh', 'th', 'rh', 'bh', 'tlh', 'trh', 'blh', 'brh', 'mover'];
        const cssSet = [
            { width: 10, height: '100%', left: 0, top: 0, cursor: 'ew-resize' },
            { width: '100%', height: 10, left: 0, top: 0, cursor: 'ns-resize' },
            { width: 10, height: '100%', right: 0, top: 0, cursor: 'ew-resize' },
            { width: '100%', height: 10, left: 0, bottom: 0, cursor: 'ns-resize' },
            { width: 30, height: 30, left: 0, top: 0, cursor: 'nw-resize' },
            { width: 30, height: 30, right: 0, top: 0, cursor: 'ne-resize' },
            { width: 30, height: 30, left: 0, bottom: 0, cursor: 'sw-resize' },
            { width: 30, height: 30, right: 0, bottom: 0, cursor: 'se-resize' },
            { width: 100, height: 100, left: 'calc(50% - 50px)', top: 'calc(50% - 50px)', cursor: 'move' }
        ];

        createHandles(0);

        function createHandles(index) {

            if (index < nameSet.length) {

                const currentHandle = document.createElement('div');

                const css = {

                    'background-color': 'transparent',
                    position: 'absolute',
                    'z-index': 10

                };

                currentHandle.setAttribute('name', nameSet[index]);
                currentHandle.setAttribute('class', 'jts_liquid_box_handle_' + boxID);

                JTS(currentHandle).css(css).css(cssSet[index]);
                JTS(container).append(currentHandle);

                liquidHandlesArray.push(currentHandle);

                createHandles(index + 1);

            }

        }


        let cX;
        let cY;
        let pX;
        let pY;
        let vX;
        let vY;
        let handle;

        JTS('.jts_liquid_box_handle_' + boxID).bind(mousedown + '.jts_liquid_box_liquid_handle_' + boxID,
            (e) => {

                e.preventDefault();

                pX = onMobile ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX;
                pY = onMobile ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY;

                handle = JTS(e.target).attr('name');

                JTS(window).bind(mousemove + '.jts_liquid_box_liquid_handle_' + boxID,
                    (eW) => {

                        cX = onMobile ? eW.originalEvent.touches[0].clientX : eW.originalEvent.clientX;
                        cY = onMobile ? eW.originalEvent.touches[0].clientY : eW.originalEvent.clientY;

                        vX = cX - pX;
                        vY = cY - pY;

                        pX = cX;
                        pY = cY;

                        switch (handle) {
                            case 'lh':
                                vX = -vX; vY = 0; break;
                            case 'th':
                                vX = 0; vY = -vY; break;
                            case 'rh':
                                vX = vX; vY = 0; break;
                            case 'bh':
                                vX = 0; vY = vY; break;
                            case 'tlh':
                                vX = -vX; vY = -vY; break;
                            case 'trh':
                                vX = vX; vY = -vY; break;
                            case 'blh':
                                vX = -vX; vY = vY; break;
                            case 'brh':
                                vX = vX; vY = vY; break;
                            case 'mover':
                                vX = vX; vY = vY; break;
                        }

                        liquidResize(vX, vY);

                    }).bind(mouseup + '.jts_liquid_box_liquid_handle_' + boxID,
                    (eW) => {

                        JTS(window).unbind('.jts_liquid_box_liquid_handle_' + boxID);

                    });

            }).bind(mouseover + '.jts_liquid_box_liquid_handle_' + boxID, (e) => {

                JTS(e.target).css('background-color', 'rgba(71, 171, 198,0.8)');

            }).bind(mouseout + '.jts_liquid_box_liquid_handle_' + boxID, (e) => {

                JTS(e.target).css('background-color', 'transparent');

            });

        function liquidResize(pVX, pVY) {

            let w = JTS(container).outerWidth();
            let h = JTS(container).outerHeight();

            let left = container.offsetLeft;
            let top = container.offsetTop;

            alreadyLiquid = true;

            if (JTS.jBrowser() === 'firefox' && parentBoxSizing === 'border-box') {

                left -= parentBorderSizeX;
                top -= parentBorderSizeY;

            }

            let x = left;
            let y = top;

            if (handle !== 'mover') {

                const right = left + w;
                const bottom = top + h;

                w += pVX;
                h += pVY;

                w = w < MINIMUM_SIZE ? MINIMUM_SIZE : w;
                h = h < MINIMUM_SIZE ? MINIMUM_SIZE : h;

                switch (handle) {
                    case 'lh':
                        x = right - w; break;
                    case 'th':
                        y = bottom - h; break;
                    case 'tlh': x = right - w; y = bottom - h; break;
                    case 'trh':
                        y = bottom - h; break;
                    case 'blh':
                        x = right - w; break;
                }

            }
            else {

                x += pVX;
                y += pVY;

            }

            previousContainerWidth = w;
            previousContainerHeight = h;
            previousContainerX = x;
            previousContainerY = y;

            const css = {

                width: w,
                height: h,
                left: x,
                top: y,
                margin: '0px',
                position: 'absolute'

            };

            JTS(container).css(css);
            JTS(container).emits(JTS.built_in_events.jLIQUID_BOX_RESIZE);

        }

    }

    function desktopScroll(e) {

        const SCROLL_VY = 130;

        const dY = -(e.originalEvent.wheelDelta) || e.originalEvent.detail;

        const vY = dY < 0 ? -SCROLL_VY : SCROLL_VY;

        const containerHeight = JTS(container).outerHeight();
        const sliderHeight = JTS(slidingBox).outerHeight();

        let y = parseInt((slidingBox.offsetTop).toString(), null) - vY;
        if (y > 0 || sliderHeight < containerHeight) {

            y = 0;

        }
        else if (y < containerHeight - sliderHeight) {

            y = containerHeight - sliderHeight;

        }

        currentY = y;

        JTS(slidingBox).css('top', y);
        setMarkerY(containerHeight, sliderHeight, Math.abs(y));

    }

    function getRootN() {

        let flag = true;
        let eParent = container;
        let rParent = eParent;

        while (eParent) {

            eParent = JTS(eParent).offsetPs()[0];

            if (eParent) {

                rParent = eParent;

            }

        }

        if (rParent.nodeName.toLowerCase() !== '#document') {

            JTS(window).unbind('.jts_liquid_box_events_' + boxID);
            JTS(container).unbind('.jts_liquid_box_events_' + boxID);
            JTS(container).off(JTS.built_in_events.jLIQUID_BOX_RESIZE);

            /*WARNING this is hardcoded WARNING*/
            delete JTS.flow.listeners[mousedown + '-jts_liquid_box_events_' + boxID];

            if (liquidHandlesArray.length > 0) {

                JTS(liquidHandlesArray).unbind('.jts_liquid_box_liquid_handle_' + boxID);

            }

            flag = false;

        }

        return false;

    }

    function liquid() {

        JTS(container).addClass('jts_liquid_box_' + boxID).css('overflow', 'hidden');
        JTS(slidingBox).addClass('jts_liquid_box_slider_' + boxID).css(slidingBoxCSS);
        JTS(scrollMarker).addClass('jts_liquid_box_marker' + boxID).css(scrollMarkerCss);
        JTS(slidingBox).append(JTS(container).html());
        JTS(container).html('').append(slidingBox);
        JTS(container).append(scrollMarker);

        JTS(container).addClassRecursive('jts_liquid_box_no_scroll_' + boxID);
        JTS(slidingBox).addClassRecursive('jts_liquid_box_touch_scroll_' + boxID);

        previousContainerWidth =   JTS(container).outerWidth();
        previousContainerHeight =  JTS(container).outerHeight();
        previousParentWidth =      JTS(container).offsetPs().outerWidth();
        previousParentHeight =     JTS(container).offsetPs().outerHeight();
        previousSlidingBoxHeight = JTS(slidingBox).outerHeight();

        setSize();
        setListeners();

        if (isLiquid) {

            addLiquidFunctions();

        }

    }

    function scrollWithMarker(vY) {

        let y = scrollMarker.offsetTop;
        const markerHeight = JTS(scrollMarker).outerHeight();
        const containerHeight = JTS(container).outerHeight();

        y += vY;
        if (y < 0) {

            y = 0;

        }
        else if (y > containerHeight - markerHeight) {

            y = containerHeight - markerHeight;

        }

        JTS(scrollMarker).css('top', y);
        setBoxY(containerHeight, y);

    }

    function scrollWithTouch(vY) {

        let y = slidingBox.offsetTop;
        const containerHeight = JTS(container).outerHeight();
        const sliderHeight = JTS(slidingBox).outerHeight();

        y += vY;
        if (y > 0 || sliderHeight < containerHeight) {

            y = 0;

        }
        else if (y < containerHeight - sliderHeight) {

            y = containerHeight - sliderHeight;

        }

        currentY = y;

        JTS(slidingBox).css('top', y);
        setMarkerY(containerHeight, sliderHeight, Math.abs(y));

    }

    function setBoxY(containerHeight, y) {

        const sliderHeight = JTS(slidingBox).outerHeight();

        y = y * (sliderHeight / containerHeight);

        currentY = -y;

        JTS(slidingBox).css('top', -y);

    }

    function setListeners() {

        JTS(window).bind('resize.' + 'jts_liquid_box_events_' + boxID,
            (e) => {

                if (!getRootN()) {

                    return;

                }

                setSize(e);

            });

        JTS(window).bind('click.jts_liquid_box_events_' + boxID,
            () => {

                if (!getRootN()) {

                    return;

                }

            });

        JTS(container).on(JTS.built_in_events.jLIQUID_BOX_RESIZE, setSize);


        JTS(container).bind(mouseover + '.jts_liquid_box_events_' + boxID,
            (e) => {

                onNoScroll = true;

            }).bind(mouseout + '.jts_liquid_box_events_' + boxID, (e) => {

                if (!JTS(e.relatedTarget) || !JTS(e.relatedTarget).hasClass('jts_liquid_box_no_scroll_' + boxID)) {

                    onNoScroll = false;

                }

            });

        JTS(window).bind('mousewheel DOMMouseScroll MozMousePixelScroll.' + 'jts_liquid_box_events_' + boxID,
            (e) => {

                if (onNoScroll) {

                    e.preventDefault();
                    desktopScroll(e);

                }

            });

        JTS(scrollMarker).bind(mousedown + '.jts_liquid_box_events_' + boxID,
            (e) => {

                e.preventDefault();

                let cY;
                let pY;
                let vY;

                pY = onMobile ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY;

                JTS(window).bind(mousemove + '.jts_liquid_box_events_' + boxID,
                    (eW) => {

                        cY = onMobile ? eW.originalEvent.touches[0].clientY : eW.originalEvent.clientY;
                        vY = cY - pY;
                        pY = cY;

                        scrollWithMarker(vY);

                    }).bind(mouseup + '.jts_liquid_box_events_' + boxID, (eW) => {

                        JTS(window).unbind(mousemove + '.jts_liquid_box_events_' + boxID);
                        JTS(window).unbind(mouseup + '.jts_liquid_box_events_' + boxID);

                    });

            });

        // IF ON MOBILE
        if (onMobile) {

            const MIN_VY = 5;

            JTS('.' + 'jts_liquid_box_touch_scroll_' + boxID).bind(mousedown + '.jts_liquid_box_events_' + boxID,
                (e) => {

                    let cY;
                    let pY;
                    let vY;
                    let dVY = 0; // this for keep vY value for slow down scroll when touch end;

                    pY = e.originalEvent.touches[0].clientY;
                    cY = pY;

                    JTS(window).bind(mousemove + '.jts_liquid_box_events_' + boxID,
                        (eW) => {

                            eW.preventDefault();

                            cY = eW.originalEvent.touches[0].clientY;
                            vY = cY - pY;
                            pY = cY;

                            dVY = vY === 0 ? dVY : vY;

                            scrollWithTouch(vY);

                        }).bind(mouseup + '.jts_liquid_box_events_' + boxID, (eW) => {

                            JTS(window).unbind(mousemove + '.jts_liquid_box_events_' + boxID);
                            JTS(window).unbind(mouseup + '.jts_liquid_box_events_' + boxID);

                            if (Math.abs(dVY) > MIN_VY) {

                                slowSlideFromTouch(dVY);

                            }

                        });

                });

        }

    }

    function setMarkerHeight() {

        const containerHeight = JTS(container).outerHeight();
        const sliderHeight = JTS(slidingBox).outerHeight();

        const height = Math.round(containerHeight * (containerHeight / sliderHeight));
        let display = 'block';

        if (sliderHeight < containerHeight) {

            display = 'none';

        }

        const css = {

            height,
            display

        };

        JTS(scrollMarker).css(css);

    }

    function setMarkerY(containerHeight, sliderHeight, y) {

        y = y * (containerHeight / sliderHeight);

        JTS(scrollMarker).css('top', y);

    }

    function setSize(e?) {

        setMarkerHeight();

        if (size) {

            setSliderYFromResize(e);

        }

        if (!size) {

            size = true;

        }

    }

    function slowSlideFromTouch(vY) {

        // let FRICTION = 0.92;
        const startVY = vY;

        inSliding = true;

        JTS.jAnimate(1000, slowSlide, {

            timing_function : 'linear',
            reverse : true

        });

        // slowSlide();

        function slowSlide(progress) {

            if (Math.abs(vY) > 0.2) {

                vY = startVY * progress;

                scrollWithTouch(vY);

                // vY *= FRICTION;
                // setTimeout(slowSlide,16);

            }
            else {

                vY = 0;
                inSliding = false;

            }

        }

    }

    function setSliderYFromResize(e) {

        const containerWidth =  JTS(container).outerWidth();
        const containerHeight = JTS(container).outerHeight();
        const containerParentWidth = JTS(container).offsetPs().outerWidth();
        const containerParentHeight = JTS(container).offsetPs().outerHeight();
        const sliderHeight = JTS(slidingBox).outerHeight();

        let boxY = currentY * (sliderHeight / previousSlidingBoxHeight);

        if (sliderHeight < containerHeight) {

            boxY = 0;

        }
        if (boxY > 0) {

            boxY = 0;

        }
        else if (!(sliderHeight < containerHeight) && boxY < containerHeight - sliderHeight) {

            boxY = containerHeight - sliderHeight;

        }

        if (alreadyLiquid && e.type !== JTS.built_in_events.jLIQUID_BOX_RESIZE) {

            const x = previousContainerX * (containerParentWidth / previousParentWidth);
            const y = previousContainerY * (containerParentHeight / previousParentHeight);

            const posCss = {

                left: x,
                top: y

            };

            previousContainerX = x;
            previousContainerY = y;

            JTS(container).css(posCss);

        }

        previousSlidingBoxHeight = sliderHeight;
        previousContainerWidth = containerWidth;
        previousContainerHeight = containerHeight;
        previousParentWidth = containerParentWidth;
        previousParentHeight = containerParentHeight;
        currentY = boxY;

        setMarkerY(containerHeight, sliderHeight, -boxY);
        JTS(slidingBox).css('top', boxY);

    }

    return this;

};

JTS.prototype.serialize = function(add? , filter?) {

    const t = this;

    let toAdd =     null;
    let toFilter =  null;

    if (arguments.length === 1) {

        if (typeof arguments[0] === 'string') {

            toFilter = arguments[0];

        }
        else {

            toAdd = arguments[0];

        }

    }
    else if (arguments.length === 2) {

        toAdd =     add;
        toFilter =  filter;

    }

    const types = {

        select         : 0,
        textarea       : 0,
        optgroup       : 0,
        option         : 0,
        text           : 0,
        checkbox       : 0,
        password       : 0,
        radio          : 0,
        color          : 0,
        date           : 0,
        file           : 0,
        'datetime-local' : 0,
        email          : 0,
        month          : 0,
        number         : 0,
        range          : 0,
        search         : 0,
        tel            : 0,
        image          : 0,
        time           : 0,
        url            : 0,
        week           : 0,
        hidden         : 0

    };

    const object = {};

    const elements = [];
    const values =   [];
    const names =    [];

    t.each(pushSet);
    JTS(elements).each(getValues);
    fillObject(0);

    if (toAdd) {

        addValues();

    }

    function pushSet(index, element) {

        if (element === window){

            element = JTS('body')[0];

        }

        recursivePush(0, [element]);

        function recursivePush(i, set) {

            if (!set) {

                return;

            }

            if (i < set.length) {

                const a = set[i].nodeType === 1;
                const sub1 = (set[i].tagName).toLowerCase() === 'input';
                const sub2 = (set[i].tagName).toLowerCase() === 'select';
                const sub3 = (set[i].tagName).toLowerCase() === 'textarea';
                const sub4 = (set[i].tagName).toLowerCase() === 'optgroup';
                const sub5 = (set[i].tagName).toLowerCase() === 'option';


                if ( a && (sub1 || sub2 || sub3 || sub4 || sub5)) {

                    let flag = false;

                    const name = JTS(set[i]).attr('name');

                    if (name) {

                        for (const parsedName of names) {

                            if (name === parsedName) {

                                flag = true;
                                break;

                            }

                        }

                        names.push(name);

                    }

                    if (toFilter) {

                        const check1 = toFilter.match(RegExp(set[i].tagName, 'i'));
                        const check2 = toFilter.match(RegExp(JTS(set[i]).attr('type'), 'i'));
                        const check3 = toFilter.match(RegExp(name));

                        if (check1 || check2 || check3) {

                            flag = true;

                        }

                    }

                    if (!flag) {

                        elements.push(set[i]);

                    }

                }
                else {

                    recursivePush(0, set[i].childNodes);

                }

                recursivePush(i + 1, set);

            }

        }

    }

    function getValues(index, element) {

        values.push(JTS(element).value());

    }

    function fillObject(index) {

        if (index < elements.length) {

            const tag = (elements[index].tagName).toLowerCase();
            const type = tag === 'select' || tag === 'textarea' || tag === 'optgropup' || tag === 'option' ? '' : JTS(elements[index]).attr('type');
            const name = getName(elements[index], tag, type);
            const value = values[index];

            if (tag === 'select' || type === 'checkbox' || type === 'file' || tag === 'optgroup' || tag === 'option') {

                parseValue(name, value);

            }
            else {

                object[name] = values[index];

            }

            fillObject(index + 1);

        }

    }

    function addValues() {

        for (const n in toAdd) {

            if (toAdd.hasOwnProperty(n)){

                parseValue(n, toAdd[n]);

            }

        }

    }

    function getName(e, tag, type) {

        const id = type || tag;
        const idCounter = types[id] === 0 ? '' : '_' + types[id];
        const parsedType = type ? '_' + type : '';
        const name = JTS(e).attr('name') || 'serialized_' + tag + parsedType + idCounter;

        if (!JTS(e).attr('name')) {

            types[id] = types[id] + 1;

        }

        return name;

    }

    function parseValue(name, value) {

        if (!value) {

            object[name] = false;
            return;

        }

        const constructor = String(value.constructor);

        if (constructor.match(/Array/) || constructor.match(/FileList/)) {

            for (let i = 0; i < value.length; i++) {

                const id = i === 0 ? '' : '_v' + i;

                object[name + id] = value[i];

            }

        }
        else {

            object[name] = value;

        }

    }

    return object;

};

JTS.prototype.shell = function(configuration?: any) {

    const t = this;

    if (t.length === 0){

        return null;

    }

    const HANDLE_SIZE = 10;
    const OL_LEFT_GAP = 45;
    const V_GAP = 10;
    const SCROLL_X_EASING = 0.3;
    const SCROLL_Y_EASING = 18;

    const color =           configuration && configuration.color ? configuration.color : '#5acc06';
    const bColor =          configuration && configuration.background_color ? configuration.background_color : '#101010';
    const runColor =        configuration && configuration.run_color ? configuration.run_color : '#2b2b2b';
    const filterFunction =  configuration && configuration.filter_function ? configuration.filter_function : (par) => par;
    const shellID =         new Date().getTime() + '_' + Math.round(Math.random() * 1000) ;

    const tShell =           t[0];
    let shellWidth =       JTS(tShell).outerWidth();
    let shellHeight =      JTS(tShell).outerHeight();
    let olPreviousX =      0;
    let olPreviousY =      0;
    let rightBound =       shellWidth;
    let xHandleReset =     false;
    let yHandleReset =     false;

    let focused =     true;
    let currentLi =   null;
    const currentVal =  [''];
    const grid =        [[]];


    let colIndex =    -1;
    let rowIndex =     0;

    JTS(tShell).css({

        'background-color' : bColor,
        overflow         : 'hidden',
        position         : JTS(tShell).css('position') === 'static' || JTS(tShell).css('position') === 'relative' ? 'relative' : 'absolute'

    }).addClass('jts_shell_element');

    const ol =      document.createElement('div');
    const li =      document.createElement('div');
    const blink =   document.createElement('div');
    const gap =     document.createElement('div');
    const run =     document.createElement('div');
    const vHandle = document.createElement('div');
    const oHandle = document.createElement('div');

    const style = '<style id="jts_shell_style_' + shellID + '"  type="text/css">' +
        '#jts_shell_ol_' + shellID + '{list-style:none;border:none;counter-reset:jts_shell_number;position:absolute;padding-top:10px;width:auto;}' +
        '#jts_shell_ol_' + shellID + ' div.li{counter-increment:jts_shell_number;font-size:15px;font-family:Verdana;position:relative;border-left:solid 1px ' + color + ';padding-left:5px;left:45px;}' +
        '#jts_shell_ol_' + shellID + ' div.li::before{display:block;content:counter(jts_shell_number);color:' + color + ';width:39px;text-align:right;left:-45px;position:absolute;}' +
        '#jts_shell_ol_' + shellID + ' div.li span.fake{color:transparent;display:inline;position:relative;}' +
        '#jts_shell_ol_' + shellID + ' div.li div{position:relative;height:18px;width:auto;color:' + color + ';display:inline;}' +
        '#jts_shell_blink_' + shellID + '{border-left:1px solid ' + color + ';animation-duration:0.5s;animation-direction:alternate;animation-iteration-count:infinite;animation-timing-function:linear;animation-name:jts_blink;}' +
        '#jts_shell_run_' + shellID +
        '{position:absolute;width:50px;height:50px;border-radius:2px;background-color:' + runColor + ';color:' + color + ';cursor:pointer;font-size:23px;text-align:center;border:solid 2px ' + color + ';padding-top:10px;z-index:2;}' +
        '@keyframes jts_blink{0%{opacity:1;}50%{opacity:1;}51%{opacity:0;}100%{opacity:0;}}' +
        '</style>';

    JTS(ol).attr('id', 'jts_shell_ol_' + shellID).addClass('jts_shell_element');
    JTS(li).addClass('jts_shell_element li');
    JTS(blink).attr('id', 'jts_shell_blink_' + shellID).addClass('jts_shell_element');
    JTS(gap).attr('id', 'jts_shell_gap_' + shellID).addClass('jts_shell_element').html('gap');
    JTS(run).attr('id', 'jts_shell_run_' + shellID).addClass('jts_shell_element ts-font-helvetica').html('run');
    JTS(vHandle).attr('id', 'jts_vh_' + shellID)
        .addClass('jts_shell_element').css({ height: 0, width: HANDLE_SIZE, top: 0, left: shellWidth - HANDLE_SIZE});
    JTS(oHandle).attr('id', 'jts_oh_' + shellID)
        .addClass('jts_shell_element').css({ height: HANDLE_SIZE, width: 0, left: 0 , top: shellHeight - HANDLE_SIZE});


    JTS([vHandle, oHandle]).css({

        position         : 'absolute',
        'background-color' : color,
        'border-radius'    : 2,
        'z-index'          : 3,
        cursor           : 'pointer',
        display          : 'none',
        opacity          : 0.5,
        'box-shadow'       : '0px 0px 3px 3px rgba(255,255,255,0.5)'

    });

    JTS(blink).css({

        'z-index'  : 10,
        width    : 'auto',
        height   : 20

    });

    JTS(gap).css({

        width    : 35,
        opacity  : 0,
        position : 'relative'

    });

    JTS(run).css({

        top : shellHeight - 50,
        left: shellWidth - 50

    });

    JTS('head').append(style);

    JTS(ol).append(li);
    JTS(blink).append(gap);
    JTS(li).append(blink);
    JTS(tShell).append(ol);
    JTS(tShell).append([run, vHandle, oHandle]);

    currentLi = li;

    setListeners();

    function executeCode() {

        let val = '';

        for (let i = 0; i < currentVal.length; i++) {

            val += currentVal[i] + (i === currentVal.length - 1 ? '' : '\n');

        }

        try {

            new Function(filterFunction(String(val)))();

        }
        catch (e) {

            console.log('JTS@Shell : code error');

        }


    }

    function getRootN() {

        let eParent = tShell;
        let rParent = eParent;

        while (eParent) {

            eParent = JTS(eParent).offsetPs()[0];

            if (eParent) {

                rParent = eParent;

            }

        }

        if (rParent.nodeName.toLowerCase() !== '#document') {

            JTS(window).unbind('.jts_shell_events_' + shellID);
            JTS(tShell).unbind('.jts_shell_events_' + shellID);
            JTS(tShell).off(JTS.built_in_events.jSHELL_RESIZE);
            JTS(oHandle).unbind('mousedown');
            JTS(vHandle).unbind('mousedown');
            JTS(run).unbind('click');

            /*WARNING this is hardcoded WARNING*/
            delete JTS.flow.listeners['mousemove-jts_shell_events_' + shellID];

            return false;

        }
        else {

            return true;

        }

    }

    function insertText(e) {

        e.preventDefault();

        const posCode = getPosCode();

        switch (e.keyCode) {

            case 8:
                back(posCode);
                break;
            case 13:
                enter(posCode);
                break;
            case 35:
                gotoEndLine();
                break;
            case 36:
                gotoStartLine();
                break;
            case 37:
                left(posCode);
                break;
            case 38:
                up(posCode);
                break;
            case 39:
                right(posCode);
                break;
            case 40:
                down(posCode);
                break;
            default:
                insert();
                break;

        }

        function getPosCode() {

            const nodes =  currentLi.children;
            let code =   null;

            if (colIndex === -1 && nodes.length === 1) {

                code = 1;

            }
            else if (colIndex === -1 && nodes.length > 1) {

                code = 2;

            }
            else if (colIndex !== -1 && nodes[nodes.length - 1] !== blink) {

                code = 3;

            }
            else if (colIndex !== -1 && nodes[nodes.length - 1] === blink) {

                code = 4;

            }

            return code;

        }

        function back(code) {

            switch (code) {

                case 1:
                    backUp();
                    break;
                case 2:
                    backUnite();
                    break;
                case 3:
                case 4:
                    disposeOne();
                    break;

            }

        }

        function enter(code) {

            switch (code) {

                case 2:
                    addLiUp();
                    break;
                case 3:
                    splitLi();
                    break;
                case 1:
                case 4:
                    addLiDown();
                    break;

            }

            JTS(ol).css('left', 0);

        }

        function left(code) {

            switch (code) {

                case 1:
                case 2:
                    moveUp();
                    break;
                case 3:
                case 4:
                    moveLeft();
                    break;

            }

        }

        function up(code) {

            moveUp();

        }

        function right(code) {

            switch (code) {

                case 2:
                case 3:
                    moveRight();
                    break;
                case 1:
                case 4:
                    moveDown();
                    break;


            }

        }

        function down(code) {

            moveDown();

        }

        function insert() {

            if (e.originalEvent.key.length > 1) {

                return;

            }

            if (xHandleReset) {

                resetXHandle();

            }

            if (yHandleReset) {

                resetYHandle();

            }

            JTS(blink).css('position', 'absolute');

            const canvas =   document.createElement('div');
            const opacity =  e.keyCode === 32 ? 0 : 1;

            canvas.innerHTML = e.keyCode === 32 ? 'ff' : e.originalEvent.key;

            JTS(canvas).addClass('jts_shell_element').css('opacity', opacity);
            JTS(currentLi).before(canvas, blink);

            colIndex +=    1;

            grid[rowIndex].splice(colIndex, 0, canvas);

            currentVal[rowIndex] = JTS.jStringSplice(currentVal[rowIndex], colIndex, e.originalEvent.key);

            scrollRight();
            setHandleX();

        }// OK

        // sub functions
        function backUp() {

            if (yHandleReset) {

                resetYHandle();

            }

            if (rowIndex === 0) {

                return;

            }

            rowIndex -= 1;
            currentLi = document.querySelector('#jts_shell_ol_' + shellID).children[rowIndex];

            JTS(currentLi.children[currentLi.children.length - 1]).dispose();
            JTS(currentLi).append(blink);

            colIndex = grid[rowIndex].length - 1;

            JTS(document.querySelector('#jts_shell_ol_' + shellID).children[rowIndex + 1]).dispose();
            grid.splice(rowIndex + 1, 1);
            currentVal.splice(rowIndex + 1, 1);

            const pos = grid[rowIndex].length === 0 ? 'relative' : 'absolute';

            JTS(blink).css('position', pos);

            setOl();
            scrollUp();
            setHandleX();
            setHandleY();

        }// OK

        function backUnite(){

            if (yHandleReset) {

                resetYHandle();

            }

            if (rowIndex === 0) {

                return;

            }

            rowIndex -=       1;
            colIndex =        grid[rowIndex].length - 1;
            grid[rowIndex] =  grid[rowIndex].concat(grid[rowIndex + 1]);
            currentLi =       document.querySelector('#jts_shell_ol_' + shellID).children[rowIndex];

            JTS(currentLi.children[currentLi.children.length - 1]).dispose();
            JTS(currentLi).append(blink);
            JTS(currentLi).append(grid[rowIndex + 1], blink);
            grid.splice(rowIndex + 1, 1);
            JTS(document.querySelector('#jts_shell_ol_' + shellID).children[rowIndex + 1]).dispose();

            currentVal[rowIndex] = currentVal[rowIndex] + currentVal[rowIndex + 1];

            currentVal.splice(rowIndex + 1, 1);

            setOl();
            scrollUp();
            setHandleX();
            setHandleY();

        }// OK

        function disposeOne() {

            if (xHandleReset) {

                resetXHandle();

            }

            if (yHandleReset) {

                resetYHandle();

            }

            JTS(grid[rowIndex][colIndex]).dispose();
            grid[rowIndex].splice(colIndex, 1);

            currentVal[rowIndex] =  JTS.jStringSplice(currentVal[rowIndex], colIndex, 1);
            colIndex -=             1;

            const pos = colIndex === -1 && grid[rowIndex].length === 0 ? 'relative' : 'absolute';

            JTS(blink).css('position', pos);

            scrollLeft();
            setHandleX();

        }// OK

        function addLiDown() {

            if (yHandleReset) {

                resetYHandle();

            }

            const span =  '<span class="fake jts_shell_element">fake</fake>';
            const nLi =   document.createElement('div');

            JTS(currentLi).append(span);
            JTS(ol).append(nLi, currentLi);

            currentLi =    nLi;
            rowIndex +=    1;
            colIndex =    -1;

            JTS(currentLi).append(blink).addClass('jts_shell_element li');
            grid.splice(rowIndex, 0, []);
            currentVal.splice(rowIndex, 0, '');

            JTS(blink).css('position', 'relative');

            resetOl();
            scrollDown();
            setHandleX();
            setHandleY();

        }// OK

        function addLiUp() {

            if (yHandleReset) {

                resetYHandle();

            }

            const span = '<span class="fake jts_shell_element">fake</fake>';
            const nLi =  document.createElement('div');

            JTS(currentLi).append(span);
            JTS(ol).before(nLi, currentLi);

            currentLi = nLi;
            colIndex =  -1;

            JTS(currentLi).append(blink).addClass('jts_shell_element li');
            grid.splice(rowIndex, 0, []);
            currentVal.splice(rowIndex, 0, '');

            JTS(blink).css('position', 'relative');

            resetOl();
            scrollUp();
            setHandleX();
            setHandleY();

        }// OK

        function splitLi() {

            if (yHandleReset) {

                resetYHandle();

            }

            const span =         '<span class="fake jts_shell_element">fake</fake>';
            const nLi =           document.createElement('div');
            const rightContent =  [];
            const leftContent =   [];

            for (let i = 0; i <= colIndex; i++){

                rightContent.push(grid[rowIndex][i]);

            }

            for (let l = colIndex + 1 ; l < grid[rowIndex].length ; l++) {

                leftContent.push(grid[rowIndex][l]);

            }

            JTS(currentLi).html('');
            JTS(currentLi).append(rightContent).append(span);
            JTS(nLi).append(leftContent);

            JTS(ol).append(nLi, currentLi);

            currentLi = nLi;

            JTS(currentLi).before(blink).addClass('jts_shell_element li');

            grid[rowIndex] = rightContent;

            grid.splice(rowIndex + 1, 0, leftContent);

            const rightVal = currentVal[rowIndex].substr(0, colIndex + 1);
            const leftVal =  currentVal[rowIndex].substr(colIndex + 1);

            currentVal[rowIndex] = rightVal;

            currentVal.splice(rowIndex + 1, 0, leftVal);

            colIndex =   -1;
            rowIndex += 1;

            resetOl();
            scrollDown();
            setHandleX();
            setHandleY();

        }// OK

        function moveUp() {

            if (yHandleReset) {

                resetYHandle();

            }

            if (rowIndex === 0) {

                return;

            }

            const span = '<span class="fake jts_shell_element">fake</fake>';

            JTS(currentLi).append(span);

            rowIndex -= 1;
            currentLi = document.querySelector('#jts_shell_ol_' + shellID).children[rowIndex];

            JTS(currentLi.children[currentLi.children.length - 1]).dispose();

            colIndex = grid[rowIndex].length - 1;

            JTS(currentLi).append(blink);

            const pos = grid[rowIndex].length === 0 ? 'relative' : 'absolute';

            JTS(blink).css('position', pos);

            setOl();
            scrollUp();
            setHandleX();
            setHandleY();

        }// OK

        function moveLeft() {

            if (xHandleReset) {

                resetXHandle();

            }

            if (yHandleReset) {

                resetYHandle();

            }

            JTS(currentLi).before(blink, grid[rowIndex][colIndex]);

            colIndex -= 1;

            scrollLeft();
            setHandleX();

        }// OK

        function moveDown() {

            if (yHandleReset) {

                resetYHandle();

            }

            if (rowIndex + 1 === grid.length){

                return;

            }

            const span = '<span class="fake jts_shell_element">fake</fake>';

            JTS(currentLi).append(span);

            rowIndex += 1;
            currentLi = document.querySelector('#jts_shell_ol_' + shellID).children[rowIndex];

            JTS(currentLi.children[currentLi.children.length - 1]).dispose();

            colIndex = - 1;

            JTS(currentLi).before(blink);

            const pos = grid[rowIndex].length === 0 ? 'relative' : 'absolute';

            JTS(blink).css('position', pos);

            resetOl();
            scrollDown();
            setHandleX();
            setHandleY();

        }// OK

        function moveRight() {

            if (xHandleReset) {

                resetXHandle();

            }

            if (yHandleReset) {

                resetYHandle();

            }

            JTS(currentLi).append(blink, grid[rowIndex][colIndex + 1]);

            colIndex += 1;

            scrollRight();
            setHandleX();

        }// OK

        function gotoEndLine(){

            if (yHandleReset) {

                resetYHandle();

            }

            JTS(currentLi).append(blink);

            colIndex = grid[rowIndex].length - 1;

            setOl();
            setHandleX();

        }// OK

        function gotoStartLine() {

            if (yHandleReset) {

                resetYHandle();

            }

            JTS(currentLi).before(blink);

            colIndex = -1;

            resetOl();
            setHandleX();

        }// OK

    }

    function moveHandleX(vX) {

        const width = JTS(oHandle).outerWidth();
        let x =     JTS(oHandle).localCoordinates().left;

        x += vX;

        if (x < 0) {

            x = 0;

        }
        else if (x + width > shellWidth){

            x = shellWidth - width;

        }

        JTS(oHandle).css('left', x);

        setOlPositionX(x);

    }

    function moveHandleY(vY) {

        const height = JTS(vHandle).outerHeight();
        let y = JTS(vHandle).localCoordinates().top;

        y += vY;

        if (y < 0) {

            y = 0;

        }
        else if (y + height > shellHeight) {

            y = shellHeight - height;

        }

        JTS(vHandle).css('top', y);

        setOlPositionY(y);

    }

    function resizeDealerZ(){

        shellWidth =  JTS(tShell).outerWidth();
        shellHeight = JTS(tShell).outerHeight();

        JTS(run).css({

            top: shellHeight - 50,
            left: shellWidth - 50,

        });

        JTS(oHandle).css('top', shellHeight - HANDLE_SIZE);
        JTS(vHandle).css('left', shellWidth - HANDLE_SIZE);

        JTS(ol).css({

            left: 0,
            top : 0

        });

        rightBound = shellWidth;

        setHandleX();
        setHandleY();

        xHandleReset = true;
        yHandleReset = true;

    }

    function resetOl() {

        rightBound = shellWidth;

        JTS(ol).css('left', 0);

    }

    function resetXHandle() {

        xHandleReset = false;

        setOl();

    }

    function resetYHandle() {

        yHandleReset = false;

        const liOffset  =  JTS(currentLi).localCoordinates().top;
        const targetPos =  V_GAP;
        const olHeight =   JTS(ol).outerHeight();

        let olOffset = -(liOffset - targetPos);

        if (olOffset + olHeight + V_GAP < shellHeight) {

            olOffset = -((olHeight - shellHeight) + V_GAP);

        }

        if (olOffset > 0) {

            olOffset = 0;

        }

        JTS(ol).css('top', olOffset);

        setHandleY();

    }

    function scrollDown() {

        const liPos =    JTS(currentLi).localCoordinates().top;
        let olOffset = JTS(ol).localCoordinates().top;

        if ((liPos + SCROLL_Y_EASING) - Math.abs(olOffset) > shellHeight) {

            olOffset =  -(liPos - (shellHeight - V_GAP - SCROLL_Y_EASING));

            JTS(ol).css('top', olOffset);

        }

    }

    function scrollLeft() {

        const blinkPos = JTS(blink).localCoordinates().left;
        let olLeft =   JTS(ol).localCoordinates().left;
        const olWidth =  JTS(ol).outerWidth();

        if (blinkPos - Math.abs(olLeft + OL_LEFT_GAP) < OL_LEFT_GAP) {

            const gap2 = shellWidth * SCROLL_X_EASING;

            olLeft += gap2;
            rightBound -= gap2;

            JTS(ol).css('left', olLeft);

            if (olLeft > 0) {

                resetOl();

            }

        }

        if (olWidth + OL_LEFT_GAP  < shellWidth) {

            resetOl();

        }

    }

    function scrollRight() {


        const blinkPos = JTS(blink).localCoordinates().left;

        if (blinkPos + OL_LEFT_GAP > rightBound) {

            const gap2    = shellWidth * SCROLL_X_EASING;
            const olLeft = JTS(ol).localCoordinates().left - gap2;

            rightBound += gap2;

            JTS(ol).css('left', olLeft);

        }

    }

    function scrollUp() {

        const liPos =    JTS(currentLi).localCoordinates().top;
        let olOffset = JTS(ol).localCoordinates().top;
        const olHeight = JTS(ol).outerHeight();

        if ( liPos - Math.abs(olOffset) <= 0) {

            olOffset = -(liPos - V_GAP);

            JTS(ol).css('top', olOffset);

        }

        if (olOffset + olHeight + V_GAP < shellHeight) {

            olOffset = -(olHeight - (shellHeight - V_GAP));

            if (olOffset > 0) {

                olOffset = 0;

            }

            JTS(ol).css('top', olOffset);

        }

    }

    function setHandleX() {

        const olWidth =  JTS(ol).outerWidth() + OL_LEFT_GAP;
        const olOffset = JTS(ol).localCoordinates().left;

        if (olWidth > shellWidth) {

            const totalWidth =  olWidth + (shellWidth * SCROLL_X_EASING);
            const handleWidth = shellWidth * (shellWidth / totalWidth);
            const handlePos =   Math.abs(olOffset) * (shellWidth / totalWidth);

            JTS(oHandle).css({

                display : 'block',
                left    : handlePos,
                width   : handleWidth

            });

        }
        else {

            JTS(oHandle).css('display', 'none');

        }

    }

    function setHandleY() {

        const olHeight = JTS(ol).outerHeight() + V_GAP;

        if (olHeight > shellHeight) {

            const olOffset =      Math.abs(JTS(ol).localCoordinates().top);
            const handleHeight =  shellHeight * (shellHeight / olHeight);
            const handlePos =     olOffset * (shellHeight / olHeight);

            JTS(vHandle).css({

                display : 'block',
                top     : handlePos,
                height  : handleHeight

            });

        }
        else {

            JTS(vHandle).css('display', 'none');

        }

    }

    function setListeners() {

        JTS(window).bind('keydown.jts_shell_events_' + shellID, insertText);

        JTS(tShell).bind('click.jts_shell_events_' + shellID, (e) => {

            if (!focused) {

                focused = true;

                JTS(window).bind('keydown.jts_shell_events_' + shellID, insertText);

            }

            JTS(blink).css({visibility: 'visible'});

        });

        JTS(window).bind('click.jts_shell_events_' + shellID, (e) => {

            if (!getRootN()) {

                return;

            }

            if (!JTS(e.target).hasClass('jts_shell_element')) {

                focused = false;

                JTS(blink).css({ visibility: 'hidden'});
                JTS(window).unbind('keydown.jts_shell_events_' + shellID);

            }

        });

        JTS(window).bind('resize.jts_shell_events_' + shellID, () => {

            if (!getRootN()) {

                return;

            }

            resizeDealerZ();

        });

        JTS('.jts_shell_element').bind('mousemove.jts_shell_events_' + shellID, (e) => {

            e.preventDefault();

        });

        JTS(oHandle).bind('mousedown.jts_shell_events_' + shellID, (e) => {

            let vX;
            let cX;
            let pX;

            pX = JTS.jMobile() ? e.originalEvent.touches[0].clientX : e.screenX;

            JTS(window).bind('mousemove.jts_shell_ohandle',
                (eW) => {

                    e.preventDefault();

                    cX = JTS.jMobile() ? eW.originalEvent.touches[0].clientX : eW.screenX;
                    vX = cX - pX;
                    pX = cX;
                    xHandleReset = true;

                    moveHandleX(vX);

                });

            JTS(window).bind('mouseup.jts_shell_ohandle',
                (eW) => {

                    JTS(window).unbind('.jts_shell_ohandle');

                });

        });

        JTS(vHandle).bind('mousedown.jts_shell_events_' + shellID, (e) => {

            let vY;
            let cY;
            let pY;

            pY = JTS.jMobile() ? e.originalEvent.touches[0].clientY : e.screenY;

            JTS(window).bind('mousemove.jts_shell_vhandle',
                (eW) => {

                    eW.preventDefault();

                    cY = JTS.jMobile() ? eW.originalEvent.touches[0].clientY : eW.screenY;
                    vY = cY - pY;
                    pY = cY;
                    yHandleReset = true;

                    moveHandleY(vY);

                });

            JTS(window).bind('mouseup.jts_shell_vhandle',
                (eW) => {

                    JTS(window).unbind('.jts_shell_vhandle');

                });

        });

        JTS(run).bind('click', () => executeCode());

        JTS(tShell).on(JTS.built_in_events.jSHELL_RESIZE, () => resizeDealerZ());

    }

    function setOl() {

        const blinkPos  = JTS(blink).localCoordinates().left + OL_LEFT_GAP;

        if (blinkPos <= shellWidth) {

            resetOl();

        }
        else {

            rightBound = blinkPos + (shellWidth * SCROLL_X_EASING);

            const olOffset = blinkPos - (shellWidth * (1 - SCROLL_X_EASING));
            JTS(ol).css('left', -olOffset);

        }


    }

    function setOlPositionX(x) {

        const totalWidth = JTS(ol).outerWidth() + OL_LEFT_GAP + (shellWidth * SCROLL_X_EASING);
        const olOffset =   x * (totalWidth / shellWidth);

        JTS(ol).css('left', -olOffset);

        olPreviousX = -olOffset;

    }

    function setOlPositionY(y) {

        const olHeight = JTS(ol).outerHeight() + V_GAP;
        const olOffset = y * (olHeight / shellHeight);

        JTS(ol).css('top', -olOffset);

        olPreviousY = -olOffset;

    }

};

JTS.prototype.show = function(d?: number, configuration?: any) {

    const t = this;

    const TIME_GAP = 100;

    let property = 'opacity';
    let easing = 'linear';

    if (arguments.length === 0) {

        t.each( (i, e) => {

            if (JTS(e).css('display') !== 'none' || JTS(e).attr('jts_hidden') || JTS(e).attr('jts_showed')) {

                return;

            }

            setElementStyle(e);

        });

    }
    else if (arguments.length === 1 && typeof arguments[0] === 'number') {

        t.each(fade);

    }
    else if (arguments.length === 2 && typeof arguments[0] === 'number' && typeof arguments[1] === 'object') {

        property = configuration.method === 'slide' ? 'height' : property;
        easing = configuration.easing ? configuration.easing : easing;

        if (configuration.method === 'fade' || !(configuration.method)) {

            t.each(fade);

        }
        else if (configuration.method === 'slide') {

            t.each(slide);

        }

    }
    else {

        console.log('JTS@show: invalid arguments list');

    }

    function fade(i, e) {

        if (JTS(e).css('display') !== 'none' || JTS(e).attr('jts_hidden') || JTS(e).attr('jts_showed')) {

            return;

        }

        JTS(e).attr('jts_showed', true);

        if (configuration && configuration.startCB) {

            configuration.startCB(i, e);

        }

        const originalOpacity = parseFloat(JTS(e).css('opacity'));

        setElementStyle(e);
        JTS.originalStyles.push([e, JTS(e).attr('style')]);

        JTS(e).css('opacity', 0);
        JTS(e).css('transition', property + ' ' + (d / 1000) + 's ' + easing + ' 0s');

        setTimeout( () => {

            if (JTS(e).length > 0) {

                JTS(e).css('opacity', originalOpacity);

            }

        }, 1);

        setTimeout(  () => {

            if (JTS(e).attr('jts_showed')) {

                setElementStyle(e);
                e.attributes.removeNamedItem('jts_showed');

                if (configuration && configuration.endCB) {

                    configuration.endCB(i, e);

                }

            }

        }, d + TIME_GAP);

    }

    function slide(i, e) {

        if (JTS(e).css('display') !== 'none' || JTS(e).attr('jts_hidden') || JTS(e).attr('jts_showed')) {

            return;

        }

        JTS(e).attr('jts_showed', true);

        if (configuration && configuration.startCB) {

            configuration.startCB(i, e);

        }

        setElementStyle(e);

        JTS.originalStyles.push([e, JTS(e).attr('style')]);

        const wrapper = document.createElement('div');
        const originalStyle = JTS(e).attr('style') || '';
        const height = JTS(e).outerHeight();

        const parent = JTS(e).offsetPs();

        const wrapperCss = {

            overflow: 'hidden',
            'box-shadow': JTS(e).css('box-shadow'),
            height: 0,
            width: JTS(e).outerWidth(),
            float: JTS(e).css('float'),
            'margin-top': JTS(e).css('margin-top'),
            'margin-left': JTS(e).css('margin-left'),
            'margin-right': JTS(e).css('margin-right'),
            'margin-bottom': JTS(e).css('margin-bottom'),
            'border-radius': JTS(e).css('border-radius'),
            left: JTS(e).css('left'),
            top: JTS(e).css('top'),
            right: JTS(e).css('right'),
            bottom: JTS(e).css('bottom'),
            position: JTS(e).css('position'),
            'z-index': JTS(e).css('z-index'),
            padding : 0

        };

        const eCss = {

            'margin-left': 0,
            'margin-right': 0,
            'margin-bottom': 0,
            'margin-top': 0,
            'box-shadow': 'none',
            'border-radius': 0,
            width: '100%',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            'z-index' : 0

        };

        JTS(wrapper).css(wrapperCss).addClass('jts_hide_wrapper');
        parent.before(wrapper, e);

        JTS(wrapper).append(e);
        JTS(e).css(eCss);

        JTS(wrapper).css('transition', property + ' ' + (d / 1000) + 's ' + easing + ' 0s');

        setTimeout( () => {

            if (JTS(e).attr('jts_showed')) {

                JTS(wrapper).css('height', height);

            }

        }, TIME_GAP * 0.3);

        setTimeout(  () => {

            if (JTS(e).attr('jts_showed')) {

                parent.before(e, wrapper);
                parent[0].removeChild(wrapper);
                setElementStyle(e);
                e.attributes.removeNamedItem('jts_showed');

                if (configuration && configuration.endCB) {

                    configuration.endCB(i, e);

                }

            }

        }, d + (TIME_GAP * 2));

    }

    function setElementStyle(e) {

        let style = JTS(e).attr('style');

        for (let i = 0 ; i < JTS.originalStyles.length; i++) {

            if (JTS.originalStyles[i][0] === e) {

                style = JTS.originalStyles[i][1];

                JTS.originalStyles.splice(i, 1);
                break;

            }

        }

        style = style ? style : '';

        if (style.match('display:none;') || style.match('display: none;')) {

            style = style.replace(/display:\s?none;/, '');

        }
        else if (style.match('display : none;')){

            style = style.replace(/display : none;/, '');

        }

        JTS(e).attr('style', style);

    }

    return this;

};

JTS.prototype.showcase = function(animationsUrl: string, configuration?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    t.each((i, e) => {

        JTS(e).css('opacity', 0);

    });

    const container = t.offsetPs()[0];
    let animations;
    let currentAnimation;

    const usedAnimations = [];
    const fakeLoaderContainer = document.createElement('div');
    const showcaseID = new Date().getTime() + '_' + Math.floor(Math.random() * 500);

    JTS(container).css('overflow', 'hidden');

    JTS.jJSON(animationsUrl,  (data)  => {

        animations = data.animations;
        loadPictures();

    });

    function loadPictures() {

        const bar = document.createElement('div');

        const barCSS = {

            position: 'absolute',
            height: 10,
            width: 0,
            left: 0,
            bottom: 0,
            'background-color': '#ffba00'

        };

        JTS(bar).addClass('jts_showcase_bar_' + showcaseID).css(barCSS);
        JTS(container).append(bar);

        t.each(pushPicture);

        function pushPicture(i, e) {

            const img = new Image();
            img.src = JTS(e).attr('src');
            img.alt = 'showcase_img';

            // this for real loading
            JTS(fakeLoaderContainer).append(img);
            JTS(e).dispose();

            const percentage = (100 * ((i + 1) / (t.length - 1))) + '%';

            JTS('.jts_showcase_bar_' + showcaseID).css('width', percentage);

            if (i === t.length - 1){

                addFakeContainer();

            }

        }

        function addFakeContainer(){

            // this for real loading
            JTS(fakeLoaderContainer).css('display', 'none').attr('id', 'jts_showcase_flc_' + showcaseID);
            JTS('.jts_showcase_bar_' + showcaseID).dispose();
            JTS('body').append(fakeLoaderContainer);

            setShowcase();

        }

    }

    function setShowcase() {

        const START_FADE_IN_DURATION = 3;
        const FADE_IN_DELAY = 100;
        const READY_DELAY = (START_FADE_IN_DURATION * 1000) + 100;
        const ANIMATION_DELAY = configuration.animationDelay || 5000;
        const START_ANIMATION_DELAY = 200;
        const RESET_DELAY = 200;
        const SLIDE_DELAY = 10;
        const BACK_DELAY_T = 1000;
        const BACK_DELAY_S = 1500;
        const TEXT_OUT_LEFT = -300;
        const TEXT_IN_LEFT = 80;

        let fadeID = null;
        let readyID = null;
        let animationID = null;
        let startAnimationID = null;
        let disposeID = null;
        let resetID = null;
        let slideID = null;
        let backSID = null;
        let backTID = null;

        let currentIndex = 0;
        let nextIndex = 1;
        let inAnimation = false;
        let paused = false;

        let textContainer;
        let subtitleContainer;
        let titleContainer;
        let link;
        let previousButton;
        let nextButton;
        let pauseButton;

        const currentImageDiv = document.createElement('div');
        const nextImageDiv = document.createElement('div');

        JTS(currentImageDiv).attr('id', 'jts_cid_' + showcaseID)
            .css({ position: 'absolute', 'z-index': 0, width : '100%' , height : '100%' , top : 0 , left : 0 , opacity: 0, transition: 'opacity ' + START_FADE_IN_DURATION + 's ease-out' });
        JTS(nextImageDiv).attr('id', 'jts_nid_' + showcaseID)
            .css({ position: 'absolute', 'z-index': 1 , width : '100%' , height : '100%' , top : 0 , left : 0});

        const currentImageCanvas = document.createElement('canvas');
        const currentImageBrush = currentImageCanvas.getContext('2d');

        JTS(currentImageCanvas).attr({ id : 'jts_cic_' + showcaseID, alt: 'showcase_img' })
            .css({ position: 'absolute', top : 0 , left : 0 , width : '100%' , height : '100%'});

        resize(false);
        drawCurrentImage();
        addListeners();

        JTS(currentImageDiv).append(currentImageCanvas);
        JTS(container).append([currentImageDiv, nextImageDiv]);

        fadeIn();

        function addControls() {

            const CONTROLS_DELAY = 200;

            const controlsActivator = document.createElement('div');
            let controlsID = null;

            previousButton = document.createElement('div');
            nextButton = document.createElement('div');
            pauseButton = document.createElement('div');

            const activatorCss = {

                position: 'absolute',
                width: '100%',
                height: 65,
                'z-index': 10,
                left : 0 ,
                bottom : 0

            };

            const commonsButtonCSS = {

                position: 'absolute',
                width: 50,
                height: 50,
                cursor: 'pointer',
                'border-radius': configuration && configuration.controls &&  configuration.controls.radius ?
                    configuration.controls.radius : 3,
                'background-color' : configuration && configuration.controls &&  configuration.controls.background ?
                    configuration.controls.background : 'rgba(255,255,255,0.5)',
                color : configuration && configuration.controls &&  configuration.controls.color ?
                    configuration.controls.color :  '#303030' ,
                'font-size' : 40 ,
                'text-align' : 'center',
                bottom: 15,
                padding : '3px 0px 0px 0px',
                'box-shadow' : configuration && configuration.controls &&  configuration.controls.shadow ? configuration.controls.shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)',
                transition : 'bottom 0.5s ease-out'

            };

            JTS(controlsActivator).css(activatorCss);
            JTS(previousButton).attr('id', 'jts_showcase_previous_button_' + showcaseID)
                .append('<i class="fa fa-step-backward"></i>').addClass('jts_showcase_controls_buttons');
            JTS(nextButton).attr('id', 'jts_showcase_next_button_' + showcaseID)
                .append('<i class="fa fa-step-forward"></i>').addClass('jts_showcase_controls_buttons');
            JTS(pauseButton).attr('id', 'jts_showcase_pause_button_' + showcaseID).append('<i class="fa fa-pause"></i>').addClass('jts_showcase_controls_buttons');

            JTS(previousButton).css(commonsButtonCSS).css('left' , 25);
            JTS(pauseButton).css(commonsButtonCSS).css('left' , 'calc(50% - 12px)');
            JTS(nextButton).css(commonsButtonCSS).css('right' , 25);

            JTS(controlsActivator).append([previousButton, pauseButton, nextButton]);
            JTS(container).append(controlsActivator);

            if (!JTS.jMobile()){

                controlsID = setTimeout(() => {

                    JTS('.jts_showcase_controls_buttons').css('bottom' , -65);

                }, CONTROLS_DELAY * 5);

            }

            JTS(controlsActivator).bind('mouseover.jts_showcase_' + showcaseID , (e) => {

                clearTimeout(controlsID);
                JTS('.jts_showcase_controls_buttons').css('bottom' , 15);

            }).bind('mouseout.jts_showcase_' + showcaseID , (e) => {

                controlsID = setTimeout(() => {

                    JTS('.jts_showcase_controls_buttons').css('bottom' , -65);

                }, CONTROLS_DELAY);

            });

            JTS([previousButton, pauseButton , nextButton]).bind('click.jts_showcase_' + showcaseID, activateTransition);

            function activateTransition(e) {

                if (inAnimation) {

                    return;

                }

                clearTimeout(animationID);
                animationID = null;

                const id = JTS(this).attr('id');

                if (id.match('previous_button')) {

                    nextIndex = currentIndex === 0 ? t.length - 1 : currentIndex - 1;
                    unpause();

                }
                else if (id.match('next_button')){

                    unpause();

                }
                else if (id.match('pause_button')){

                    if (!paused){

                        paused = true;
                        JTS(pauseButton).html('').append('<i class="fa fa-play"></i>');

                    }
                    else{

                        unpause();

                    }

                }

                function unpause(){

                    paused = false;

                    JTS(pauseButton).html('').append('<i class="fa fa-pause"></i>');
                    coreAnimation(currentAnimation);

                }

                JTS(window).emits(JTS.built_in_events.jSHOWCASE_CONTROLS_PRESSED);

            }

        }

        function addListeners() {

            JTS(window).bind('resize.jts_showcase_' + showcaseID,   (e) => {

                if (!getRootN()) {

                    return;

                }

                resize(true);

            });

            JTS(window).bind('click.jts_showcase_' + showcaseID,  (e) => {

                if (!getRootN()) {}

            });

        }

        function addText() {

            textContainer = document.createElement('div');
            subtitleContainer = document.createElement('div');
            titleContainer = document.createElement('div');
            link = document.createElement('a');

            const containerCSS = {

                position: 'absolute',
                bottom: 80,
                width: '150%',
                'z-index': 11,
                overflow: 'visible'

            };

            const textCSS = {

                position : 'absolute',
                width : '100%',
                left : TEXT_OUT_LEFT,
                opacity : 0

            };

            const subtitleCSS = {

                position: 'absolute',
                width: '100%',
                left: TEXT_OUT_LEFT,
                top: 0,
                opacity: 0,
                color: configuration && configuration.text && configuration.text.subtitle_color ? configuration.text.subtitle_color : '#303030',
                'font-weight' : configuration && configuration.text && configuration.text.subtitle_weight ?
                    configuration.text.subtitle_weight : 700

            };

            const linkCSS = {

                'text-decoration': 'none',
                color: configuration && configuration.text && configuration.text.link_color ? configuration.text.link_color : '#ffffff',
                'font-weight' : configuration && configuration.text && configuration.text.link_weight ? configuration.text.link_weight : 700

            };

            const linkAttr = {

                id: 'jts_showcase_a_' + showcaseID,
                class: configuration && configuration.text && configuration.text.font_class ? configuration.text.font_class : 'ts-font-elegance',
                href: configuration.text.link[currentIndex],
                target: '_blank'

            };

            JTS(textContainer).attr('id', 'jts_showcase_text_' + showcaseID).css(containerCSS);
            JTS(subtitleContainer).attr('id', 'jts_showcase_ts_' + showcaseID).css(subtitleCSS);
            JTS(titleContainer).attr('id', 'jts_showcase_tt_' + showcaseID).css(textCSS);
            JTS(link).attr(linkAttr).css(linkCSS).html(configuration.text.title[currentIndex]);

            JTS(subtitleContainer).html(configuration.text.subtitle[currentIndex]);
            JTS(titleContainer).append(link);

            JTS(textContainer).append([subtitleContainer, titleContainer]);

            setTextSize();

            JTS(container).append(textContainer);

            slideID = setTimeout( () => {

                slideText(TEXT_IN_LEFT, 0.8);

            }, SLIDE_DELAY);

        }

        function coreAnimation(animation) {

            inAnimation = true;

            if (configuration && configuration.show_text) {

                slideText(TEXT_OUT_LEFT, 0);

            }

            const SMALL_SCREEN = 736;

            const tiles = [];
            const canvases = [];

            const containerWidth = JTS(container).outerWidth();
            const containerHeight = JTS(container).outerHeight();

            const numberOfTiles = containerWidth <= SMALL_SCREEN ? animation.tiles[0] : animation.tiles[1];
            const columns = containerWidth <= SMALL_SCREEN ? animation.columns[0] : animation.columns[1];
            const rows = containerWidth <= SMALL_SCREEN ? animation.rows[0] : animation.rows[1];
            const disposeDelay = containerWidth <= SMALL_SCREEN ? animation.dispose_delay[0] : animation.dispose_delay[1];

            const tileWidth = Math.round(containerWidth / columns);
            const tileHeight = Math.round(containerHeight / rows);
            const lastTileWidth = containerWidth - (tileWidth * (columns - 1));
            const lastTileHeight = containerHeight - (tileHeight * (rows - 1));

            setTiles(0);

            let pos = null;
            let size = null;
            let opacity = null;
            let transform = null;

            if (animation.double) {

                setTiles(1);

            }

            if (animation.start_pos) {

                pos = containerWidth <= SMALL_SCREEN ? animation.start_pos[0] : animation.start_pos[1];

            }

            if (animation.start_size) {

                size = containerWidth <= SMALL_SCREEN ? animation.start_size[0] : animation.start_size[1];

            }

            if (animation.start_opacity) {

                opacity = containerWidth <= SMALL_SCREEN ? animation.start_opacity[0] : animation.start_opacity[1];

            }

            if (animation.start_transform) {

                transform = containerWidth <= SMALL_SCREEN ? animation.start_transform[0] : animation.start_transform[1];

            }

            const transition = containerWidth <= SMALL_SCREEN ? animation.transition[0] : animation.transition[1];

            setCanvases(0);

            if (animation.double) {

                setCanvases(1);

            }

            startAnimationID = setTimeout(startAnimation, START_ANIMATION_DELAY);

            function setCanvases(canvasIndex) {

                const image = animation.double && canvasIndex === 0 ? t[currentIndex] : t[nextIndex];
                const add = canvasIndex > 0 ? numberOfTiles : 0;
                const cropData = getImageSizeAndOffset(image);
                const cropWidth = tileWidth * (cropData.width / containerWidth);
                const cropHeight = tileHeight * (cropData.height / containerHeight);

                for (let i = 0; i < numberOfTiles; i++) {

                    const cropCurrentW = Math.floor(i % columns) === columns - 1 ?
                        JTS(tiles[i]).outerWidth() * (cropData.width / containerWidth) : cropWidth;
                    const cropCurrentH = Math.floor(i / columns) === rows - 1 ?
                        JTS(tiles[i]).outerHeight() * (cropData.height / containerHeight) : cropHeight;

                    if (cropCurrentW > image.naturalWidth) {

                        // cropCurrentW = image.naturalWidth;

                    }

                    if (cropCurrentH > image.naturalHeight) {

                        // cropCurrentH = image.naturalHeight;

                    }

                    const canvas = document.createElement('canvas');
                    canvas.setAttribute('id', animation.name + '_canvas_' + canvasIndex + i + showcaseID);

                    canvas.width = cropCurrentW;
                    canvas.height = cropCurrentH;

                    const css: any = {

                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        'z-index': canvasIndex > 0 ? 1 : 2,
                        transition: transition[i]

                    };

                    if (pos) {

                        css.left = pos[i + (add * (canvasIndex * 2))];
                        css.top = pos[(i + numberOfTiles) + (add * (canvasIndex * 2))];

                    }

                    if (size) {

                        css.width = size[i + (add * (canvasIndex * 2))];
                        css.height = size[(i + numberOfTiles) + (add * (canvasIndex * 2))];

                    }

                    if (opacity) {

                        css.opacity = opacity[i + add];

                    }

                    if (transform) {

                        css.transform = transform[i + add];

                    }

                    JTS(canvas).css(css);

                    const drawX = (Math.floor(i % columns) * cropWidth) + cropData.offsetX;
                    const drawY = (Math.floor(i / columns) * cropHeight) + cropData.offsetY;
                    const b = canvas.getContext('2d');

                    b.drawImage(
                        image,
                        drawX, drawY, cropCurrentW, cropCurrentH,
                        0, 0, canvas.width, canvas.height
                    );

                    JTS(tiles[i + add]).append(canvas);
                    canvases.push(canvas);

                }

            }

            function setTiles(tileIndex) {

                for (let i = 0; i < numberOfTiles; i++) {

                    const tileX = Math.floor(i % columns) * tileWidth;
                    const tileY = Math.floor(i / columns) * tileHeight;

                    const tileCurrentW = Math.floor(i % columns) === columns - 1 ? lastTileWidth : tileWidth;
                    const tileCurrentH = Math.floor(i / columns) === rows - 1 ? lastTileHeight : tileHeight;

                    const tile = document.createElement('div');
                    tile.setAttribute('id', animation.name + '_tile_' + tileIndex + i + showcaseID);

                    const css = {

                        position: 'absolute',
                        width: tileCurrentW,
                        height: tileCurrentH,
                        left: tileX,
                        top: tileY,
                        overflow: animation.overflow

                    };

                    JTS(tile).css(css);

                    JTS(nextImageDiv).append(tile);
                    tiles.push(tile);

                }

            }

            function startAnimation() {

                if (!animation.back_visible) {

                    JTS(currentImageDiv).css('visibility', 'hidden');

                }

                startTransition();

                function startTransition() {

                    const add = animation.double ? 2 : 1;

                    let pos2 = null;
                    let size2 = null;
                    let opacity2 = null;
                    let transform2 = null;

                    if (animation.stop_pos) {

                        pos2 = containerWidth <= SMALL_SCREEN ? animation.stop_pos[0] : animation.stop_pos[1];

                    }

                    if (animation.stop_size) {

                        size2 = containerWidth <= SMALL_SCREEN ? animation.stop_size[0] : animation.stop_size[1];

                    }

                    if (animation.stop_opacity) {

                        opacity2 = containerWidth <= SMALL_SCREEN ? animation.stop_opacity[0] : animation.stop_opacity[1];

                    }

                    if (animation.stop_transform) {

                        transform2 = containerWidth <= SMALL_SCREEN ? animation.stop_transform[0] : animation.stop_transform[1];

                    }

                    for (let i = 0 ; i < canvases.length; i++) {

                        const css: any = {};

                        if (pos2) {

                            css.left = pos2[i];
                            css.top = pos2[i + (numberOfTiles * add)];

                        }

                        if (size2) {

                            css.width = size2[i];
                            css.height = size2[i + (numberOfTiles * add)];

                        }

                        if (opacity2) {

                            css.opacity = opacity2[i];

                        }

                        if (transform2) {

                            css.transform = transform2[i];

                        }

                        JTS(canvases[i]).css(css);

                    }

                    JTS(window).emits(JTS.built_in_events.jSHOWCASE_ANIMATION_START);

                    disposeID = setTimeout(clearAnimation, disposeDelay);

                }

            }

            function clearAnimation() {

                if (configuration && configuration.show_text) {

                    JTS(subtitleContainer).html(configuration.text.subtitle[nextIndex]);
                    JTS(link).attr('href', configuration.text.link[nextIndex]).html(configuration.text.title[nextIndex]);

                    slideText(TEXT_IN_LEFT, 0.8);

                }

                currentIndex = nextIndex;
                nextIndex = nextIndex === t.length - 1 ? 0 : nextIndex + 1;

                drawCurrentImage();

                JTS(currentImageDiv).css('visibility', 'visible');

                resetID = setTimeout( () => {

                    nextImageDiv.innerHTML = '';
                    JTS(window).emits(JTS.built_in_events.jSHOWCASE_ANIMATION_END);
                    setNextAnimation();

                }, RESET_DELAY);

            }

        }

        function drawCurrentImage(){

            const cropData = getImageSizeAndOffset(t[currentIndex]);

            currentImageBrush.clearRect(0, 0, currentImageCanvas.width, currentImageCanvas.height);

            currentImageBrush.drawImage(
                t[currentIndex],
                cropData.offsetX, cropData.offsetY, cropData.width, cropData.height,
                0, 0, currentImageCanvas.width, currentImageCanvas.height
            );

        }

        function fadeIn() {

            fadeID = setTimeout(innerFadeIn, FADE_IN_DELAY);

            function innerFadeIn(){

                JTS(currentImageDiv).css('opacity', 1);

                readyID = setTimeout(  () => {

                    JTS(window).emits(JTS.built_in_events.jSHOWCASE_READY);

                    setNextAnimation();

                    if (configuration && configuration.controllable) {

                        addControls();

                    }

                    if (configuration && configuration.show_text) {

                        addText();

                    }

                }, READY_DELAY);


            }

        }

        function getImageSizeAndOffset(image){

            const containerWidth = JTS(container).outerWidth();
            const containerHeight = JTS(container).outerHeight();
            const originalWidth = image.naturalWidth;
            const originalHeight = image.naturalHeight;

            let width;
            let height;
            let offsetX;
            let offsetY;

            if (containerWidth >= containerHeight) {

                parseHeight(containerWidth);

            }
            else {


                parseWidth(containerHeight);

            }

            offsetX = Math.abs((containerWidth * 0.5) - (width * 0.5));
            offsetY = Math.abs((containerHeight * 0.5) - (height * 0.5));

            function parseHeight(w) {

                width = w;
                height = originalHeight * (w / originalWidth);

                if (height < containerHeight) {

                    parseHeight(w + 1);

                }

            }

            function parseWidth(h) {

                height = h;
                width = originalWidth * (h / originalHeight);

                if (width < containerWidth) {

                    parseWidth(h + 1);

                }

            }

            const cropWidth = containerWidth * (originalWidth / width);
            const cropHeight = containerHeight * (originalHeight / height);

            offsetX = offsetX * (originalWidth / width);
            offsetY = offsetY * (originalHeight / height);

            return { width: cropWidth, height: cropHeight, offsetX, offsetY };

        }

        function getRootN() {

            let eParent = container;
            let rParent = eParent;

            while (eParent) {

                eParent = JTS(eParent).offsetPs()[0];

                if (eParent) {

                    rParent = eParent;

                }

            }

            if (rParent.nodeName.toLowerCase() !== '#document') {

                JTS(window).unbind('.jts_showcase_' + showcaseID);

                if (previousButton && nextButton) {

                    JTS([previousButton, nextButton]).unbind('click');

                }

                return false;

            }
            else {

                return true;

            }

        }

        function resize(needRedraw) {

            const containerWidth = JTS(container).outerWidth();
            const containerHeight = JTS(container).outerHeight();

            currentImageCanvas.width = containerWidth * devicePixelRatio;
            currentImageCanvas.height = containerHeight * devicePixelRatio;

            if (needRedraw && !inAnimation){

                drawCurrentImage();

            }

            if (configuration && configuration.show_text) {

                if (JTS('#jts_showcase_text_' + showcaseID)) {

                    setTextSize();

                }

            }

        }

        function setNextAnimation() {

            if (animations.length === 0) {

                for (const a of usedAnimations) {

                    animations.push(a);

                }

                usedAnimations.length = 0;

            }

            const animationIndex = Math.floor(Math.random() * animations.length);
            currentAnimation = animations[animationIndex];

            usedAnimations.push(animations[animationIndex]);
            animations.splice(animationIndex, 1);

            inAnimation = false;

            animationID = setTimeout( () => {

                coreAnimation(currentAnimation);

            }, ANIMATION_DELAY);

        }

        function setTextSize() {


            const WIDTH_SET = [0, 360, 560, 760, 1000, 1400, 10000];

            const CONTAINER_LEFT = [15, 30, 50, 60, 65, 65];
            const CONTAINER_HEIGHT = [62, 83, 95, 106, 116, 120];
            const SUBTITLE_HEIGHT = [20, 25, 28, 28, 30, 30];
            const SUBTITLE_FONT = [16, 21, 23, 23, 25, 25];
            const TITLE_HEIGHT = [47, 65, 77, 89, 101, 105];
            const TITLE_TOP = [15, 18, 18, 17, 15, 15];
            const LINK_FONT = [40, 55, 65, 76, 85, 90];

            const w = JTS(container).outerWidth();

            for (let i = 0; i < WIDTH_SET.length - 1; i++) {

                if (w > WIDTH_SET[i] && w <= WIDTH_SET[i + 1]) {

                    JTS(textContainer).css({ height: CONTAINER_HEIGHT[i], left: CONTAINER_LEFT[i] });
                    JTS(subtitleContainer).css({ height: SUBTITLE_HEIGHT[i], 'font-size': SUBTITLE_FONT[i] });
                    JTS(titleContainer).css({ height: TITLE_HEIGHT[i], top: TITLE_TOP[i] });
                    JTS(link).css('font-size', LINK_FONT[i]);
                    break;

                }

            }

        }

        function slideText(left, opacity) {


            clearTimeout(backTID);
            clearTimeout(backSID);

            const css = {

                left,
                opacity

            };

            JTS('#jts_showcase_ts_' + showcaseID).css('transition', 'opacity 1s ease-out 0.3s , left 1s ease-out 0.3s');
            JTS('#jts_showcase_tt_' + showcaseID).css('transition', 'opacity 1s ease-out 0s , left 1s ease-out 0s');
            JTS('#jts_showcase_ts_' + showcaseID).css(css);
            JTS('#jts_showcase_tt_' + showcaseID).css(css);

            if (left > 0) {

                backTID = setTimeout( ()  => {

                    JTS('#jts_showcase_tt_' + showcaseID).css('transition', 'opacity 0.5s ease-out , left 0.8s ease-in-out');
                    JTS('#jts_showcase_tt_' + showcaseID).css('left', 0).css('opacity', 1);

                }, BACK_DELAY_T);

                backSID = setTimeout( () => {

                    JTS('#jts_showcase_ts_' + showcaseID).css('transition', 'opacity 0.5s ease-out , left 0.8s ease-in-out');
                    JTS('#jts_showcase_ts_' + showcaseID).css('left', 0).css('opacity', 1);

                }, BACK_DELAY_S);

            }

        }

    }

    return this;

};

JTS.prototype.simpleSlide = function(delay?: number){

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (delay && delay < 3000){

        delay = 3000;

    }

    const container = t.offsetPs();
    let containerWidth = JTS(container).outerWidth();
    let containerHeight = JTS(container).outerHeight();
    let showedImageIndex = 0;
    let resizeID = null;
    const slideDelay = delay ? delay : 10000;
    const slideID = new Date().getTime() + '_' + Math.floor(Math.random() * 500);

    container.css('background-color', '#ffffff');

    setPicturesSize();
    setShowedImage();
    addListeners();
    startSlide();

    function addListeners(){

        JTS(window).bind('resize.jts_simple_slide_events_' + slideID, () => {

            clearTimeout(resizeID);

            resizeID = setTimeout(() => {

                containerWidth = JTS(container).outerWidth();
                containerHeight = JTS(container).outerHeight();

                setPicturesSize();

            }, 200);

        });

    }

    function getImageSize(img) {

        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        let data = null;

        if (containerWidth >= containerHeight){

            data = parseHeight(containerWidth);

        }
        else{

            data = parseWidth(containerHeight);

        }

        function parseHeight(width) {

            const w = width;
            const h = originalHeight * (w / originalWidth);

            if (h <= containerHeight){

                return parseHeight(width + 2);

            }
            else{

                return { width : w, height : h};

            }

        }

        function parseWidth(height) {

            const h = height;
            const w = originalWidth * (h / originalHeight);

            if (w <= containerWidth){

                return parseWidth(height + 2);

            }
            else{

                return { width : w, height : h};

            }

        }

        return data;

    }

    function setPicturesSize() {

        t.each(setSizeAndPosition);

    }

    function setShowedImage(){

        t.css({
            transition : 'none',
            opacity : 0
        });

        t.each((i, e) => {

            if (i === showedImageIndex){

                JTS(e).css('opacity', 1);

            }

        });

    }

    function setSizeAndPosition(i, e) {

        const size = getImageSize(e);
        const width = size.width;
        const height = size.height;

        JTS(e).css({

            width,
            height,
            left: (containerWidth * 0.5) - (width * 0.5),
            top : (containerHeight * 0.5) - (height * 0.5),
            position : 'absolute'

        });

    }

    function startSlide(){

        setTimeout(() => {

            JTS(t[showedImageIndex]).css('transition', 'opacity 0.7s linear');

            setTimeout(() => {

                JTS(t[showedImageIndex]).css('opacity', 0);
                showedImageIndex = showedImageIndex + 1 === t.length ? 0 : showedImageIndex + 1;
                JTS(t[showedImageIndex]).css('transition', 'opacity 0.7s linear');

            }, 10);

            setTimeout(() => {

                JTS(t[showedImageIndex]).css('opacity', 1);

            }, 1010);

            setTimeout(() => {

                setShowedImage();
                startSlide();

            }, 1710);

        }, slideDelay);

    }

    return this;

};

JTS.prototype.toggleClass = function(classToToggle: string) {

    const t = this;

    const classArray = classToToggle.split(' ');

    t.each(toggleVal);

    function toggleVal(i, e) {

        for (const name of classArray){

            if (JTS(e).hasClass(name.trim())) {

                JTS(e).removeClass(name.trim());

            }
            else {

                JTS(e).addClass(name.trim());

            }

        }

    }

    return this;

};

JTS.prototype.touchScroll = function(configuration: any){

    const t = this;

    t.each(activate);

    function activate(i, e){

        /*Constants*/
        const stepWidth = configuration.step_width;
        const totalWidth = configuration.total_width;
        const stepVx = configuration.step_vx; /* higher value increase the easing time */
        const showHandle = configuration.show_handle;
        const steps = Math.ceil(totalWidth / stepWidth);
        const jElement = JTS(e);

        /*Position variables*/
        const stepsPositions = [];
        let stepIndex = 0;
        let translateX = 0;
        let targetPos = 0;
        let transitionTime = 0;
        let handle;
        let handleTranslateX;

        /*Moving variables*/
        let startTouch = 0;
        let endTouch = 0;
        let currentX = 0;
        let currentY = 0;
        let previousX = 0;
        let previousY = 0;
        let vX = 0;
        let vY = 0;

        /*Find every step position*/
        for (let index = 0; index < steps; index++){

            stepsPositions.push(stepWidth * index);

        }

        /*Initialize handle if needed*/
        if (showHandle){


            handle = JTS(`<div class="jts-touch-scroll-handle"></div>`).css({

                position : 'absolute',
                top : 0,
                left : 0,
                height : 5,
                width : stepWidth * (stepWidth / totalWidth),
                'border-radius' : 5,
                opacity : 0,
                'background-color' : '#9e9e9e'

            }).addClass(configuration.handle_class ? configuration.handle_class : '');

            jElement.offsetPs().append(handle);

        }

        jElement.mouseDown(function(event){

            event.preventDefault();

            /*Reset transitions*/
            JTS(this).css({

                transition : 'unset'

            });

            if (showHandle && stepWidth < totalWidth){

                handle.css({

                    transition : 'opacity 1.5s ease-out',
                    opacity : 1,

                });

            }

            startTouch = new Date().getTime();

            /*Initialize mouse position*/
            currentX = event.type === 'mousedown' ? event.screenX : event.touches[0].clientX;
            currentY = event.type === 'mousedown' ? event.screenY : event.touches[0].clientY;

            previousX = currentX;
            previousY = currentY;

            JTS(window).mouseMove('touch_scroll_events', (wE) => {

                currentX = wE.type === 'mousemove' ? wE.screenX : wE.touches[0].clientX;
                currentY = wE.type === 'mousemove' ? wE.screenY : wE.touches[0].clientY;

                /*Compute vX and vY*/
                vX = currentX - previousX;
                vY = currentY - previousY;

                previousX = currentX;
                previousY = currentY;

                /*Check if vX need to be reduced */
                if (translateX > 0 && vX > 0 || translateX + totalWidth < stepWidth && vX < 0){

                    vX = Math.cos(Math.atan2(vY, vX)) * 0.5;

                }

                translateX += vX;

                /*Apply translate*/
                jElement.css({

                    transform : `translateX(${translateX}px)`

                });

                if (showHandle && stepWidth < totalWidth){

                    translateHandle();

                }

                /*Compute the slider step index*/
                stepIndex = Math.floor(Math.abs(translateX - (stepWidth * 0.5)) / stepWidth);


            }).mouseUp('touch_scroll_events', (eM) => {

                endTouch = new Date().getTime();

                JTS(window).unbind('.touch_scroll_events');

                /*Compute translate x and transition time*/
                targetPos = -stepsPositions[stepIndex];
                transitionTime = stepVx * (Math.abs(targetPos - translateX) / stepWidth);
                translateX = targetPos;

                /*Apply translate*/
                jElement.css({

                    transition : `transform ${transitionTime}s ease-out`,
                    transform : `translateX(${targetPos}px)`

                });

                if (showHandle && stepWidth < totalWidth){

                    handle.css({

                        transition : `transform ${transitionTime}s ease-out , opacity 1.5s ease-out`,
                        opacity : 0

                    });

                    translateHandle();

                }

                /*Emits an event with the current step index for outside listeners*/
                JTS(window).emits(JTS.built_in_events.jTOUCH_SCROLL_STEP, { current_step : stepIndex});


            });


        });

        function translateHandle(){

            handleTranslateX = Math.abs(translateX) * (stepWidth / totalWidth);
            handleTranslateX = translateX > 0 ? 0 :
                (translateX + totalWidth < stepWidth ? stepWidth - handle.outerWidth() : handleTranslateX);

            handle.css({

                transform : `translateX(${handleTranslateX}px)`

            });

        }

    }

    return t;

};

JTS.prototype.unbind = function(typeOrFamily: string) {

    const t = this;

    let types = [];
    let family = [];
    const list = [];

    if (typeOrFamily.match(/^\./)) {

        family = typeOrFamily.substring(1).split(' ');

        for (const n in JTS.flow.listeners) {

            if (JTS.flow.listeners.hasOwnProperty(n)){

                for (const f of family) {

                    if (String(n).match(RegExp('-' + f + '$'))) {

                        list.push(String(n));

                    }

                }

            }

        }

    }
    else if (typeOrFamily.match(/\w+\.\w+/)) {

        types = typeOrFamily.split('.')[0].split(' ');
        family = typeOrFamily.split('.')[1].split(' ');

        for (const n in JTS.flow.listeners) {

            if (JTS.flow.listeners.hasOwnProperty(n)){

                for (const type of types) {

                    for (const f of family) {

                        if (String(n) === type + '-' + f) {

                            list.push(String(n));

                        }

                    }

                }

            }

        }

    }
    else {

        types = typeOrFamily.split(' ');

        for (const n in JTS.flow.listeners) {

            if (JTS.flow.listeners.hasOwnProperty(n)){

                for (const type of types) {

                    if (String(n).match(RegExp('^' + type + '-'))) {

                        list.push(String(n));

                    }

                }

            }

        }

    }

    t.each(disposeListener);

    function disposeListener(i, e) {

        for (const item of list) {

            const lSet = JTS.flow.listeners[item];

            for (let l = 0; l < lSet.length; l++) {

                const listener = lSet[l];

                if (listener.element === e) {

                    lSet.splice(l, 1);
                    JTS.flow.stackIndex[item] -= 1;
                    l -= 1;

                }

            }

        }

    }

    return this;

};

JTS.prototype.value = function(val: any) {

    const t = this;

    let constructor = null;

    if (t.length === 0){

        return t;

    }

    if (arguments.length === 0) {

        return getValue();

    }
    else {

        if (val !== null) {

            constructor = String(val.constructor);

        }

        t.each(setValue);

    }

    function getValue() {

        const tag = (t[0].tagName).toLowerCase();

        switch (tag) {

            case 'select':
            case 'option':
            case 'optgroup':
                return getSelect();
            case 'input':
                if (t[0].type === 'checkbox') {
                    return getCheckbox();
                }
                else if (t[0].type === 'radio') {
                    return getRadio();
                }
                else if (t[0].type === 'file') {
                    return t[0].files.length === 0 ? getSingle() : t[0].files;
                }
                else {
                    return getSingle();
                }
            case 'textarea':
            case 'li':
            case 'param':
            case 'progress':
            case 'button':
                return getSingle();
            default:
                return null;

        }

        function getSingle() {

            return t[0].value;

        }

        function getSelect() {

            const array = [];

            let options;

            if (tag === 'select') {

                options = [];

                parseNodes(0);
            }
            else if (tag === 'optgroup') {

                options = t[0].childNodes;

            }
            else if (tag === 'option') {

                options = [t[0]];

            }

            function parseNodes(index) {

                if (index < t[0].childNodes.length){

                    const node = t[0].childNodes[index];

                    if (node.nodeType === 1 && (node.tagName).toLowerCase() === 'option') {

                        options.push(node);

                    }
                    else if (node.nodeType === 1 && (node.tagName).toLowerCase() === 'optgroup') {

                        innerParse(0,node);

                    }

                    parseNodes(index + 1);

                }

                function innerParse(subIndex,innerNode){

                    if (subIndex < innerNode.childNodes.length){

                        if (innerNode.childNodes[subIndex].nodeType === 1) {

                            options.push(innerNode.childNodes[subIndex]);

                        }

                        innerParse(subIndex + 1,innerNode);

                    }
                }

            }


            for (const option of options) {

                if (option.nodeType === 1) {

                    if ((option.tagName).toLowerCase() === 'option' && option.selected) {

                        array.push(option.value);

                    }

                }

            }

            return array.length > 0 ? array : false;

        }

        function getCheckbox() {

            const name = JTS(t[0]).attr('name');
            const array = [];

            if (name) {

                const list = document.querySelectorAll('input[type=checkbox][name=' + name + ']');

                if (list.length > 1) {


                    parseList(0,list);

                    if (array.length > 0) {

                        return array;

                    }

                }

            }

            function parseList(index,innerList) {

                if (index < innerList.length){

                    const item: any = innerList[index];

                    if (item.checked) {

                        array.push(item.value);

                    }

                    parseList(index + 1,innerList);

                }

            }

            return t[0].checked ? t[0].value : false;

        }

        function getRadio() {

            const name = JTS(t[0]).attr('name');

            if (name) {

                const list = document.querySelectorAll('input[type=radio][name=' + name + ']');

                if (list.length > 1) {

                    parseList(0,list);


                }

            }

            function parseList(index,innerList) {

                if (index < innerList.length){

                    const item: any = innerList[index];

                    if (item.checked) {

                        return item.value;

                    }

                    parseList(index + 1, innerList);
                }
            }

            return t[0].checked ? t[0].value : false;

        }

    }

    function setValue(index, element) {

        const tag = (element.tagName).toLowerCase();

        switch (tag) {

            case 'select':
            case 'option':
            case 'optgroup':
                setSelect();
                break;
            case 'input':
                if (element.type === 'checkbox' || element.type === 'radio') {

                    setRadioOrCheckbox();

                }
                else {

                    setSingle();

                }
                break;
            case 'textarea':
            case 'li':
            case 'param':
            case 'progress':
            case 'button':
                setSingle();
                break;
            default:
                break;

        }

        function setSingle() {

            let parsedValue = null;

            if (constructor != null) {

                parsedValue = constructor.match(/Array/) ? val[0] : val;

            }

            element.value = parsedValue;

        }

        function setSelect() {

            let options;

            if (tag === 'select') {

                options = [];
                pushOptions(0);

            }
            else if (tag === 'optgroup') {

                options = element.childNodes;

            }
            else if (tag === 'option') {

                options = [element];

            }

            function pushOptions(i){

                if (i < element.childNodes.length){

                    const node = element.childNodes[i];

                    if (node.nodeType === 1 && (node.tagName).toLowerCase() === 'option') {

                        options.push(node);

                    }else if (node.nodeType === 1 && (node.tagName).toLowerCase() === 'optgroup') {

                        pushInnerOption(0 , node);

                    }

                    pushOptions(i + 1);
                }

                function pushInnerOption(iG , innerNode) {

                    if (iG < innerNode.childNodes.length){

                        if (innerNode.childNodes[iG].nodeType === 1) {

                            options.push(innerNode.childNodes[iG]);

                        }

                        pushInnerOption(iG + 1 , innerNode);

                    }

                }

            }

            if (constructor.match(/Array/)) {

                parseOption(0,options);

            }
            else {

                for (const option of options) {

                    JTS(option).attr('selected', false);

                    if (option.value === String(val)) {

                        JTS(option).attr('selected', true);

                    }

                }

            }

        }

        function parseOption(i,innerOptions){

            if (i < innerOptions.length){

                JTS(innerOptions[i]).attr('selected', false);

                for (const v of val) {

                    if (innerOptions[i].value === String(v)) {

                        JTS(innerOptions[i]).attr('selected', true);

                        break;

                    }

                }

                parseOption(i + 1, innerOptions);

            }

        }

        function setRadioOrCheckbox() {

            if (constructor.match(/Array/)) {

                for (const v of  val) {

                    if (String(v) === element.value) {

                        JTS(element).attr('checked', true);

                        break;

                    }

                }

            }
            else {

                if (String(val) === element.value) {

                    JTS(element).attr('checked', true);

                }

            }

        }

    }

    return this;

};

JTS.prototype.weld = function(jTSObject) {

    const t = this;

    const e = [];

    t.each(pushElement);
    jTSObject.each(pushElement);

    function pushElement(index, element) {

        e.push(element);

    }

    return JTS(e);

};

JTS.prototype.width = function(value?: any) {

    const t = this;

    if (t.length === 0){

        return t;

    }

    if (t[0] === window) {

        return window.innerWidth;

    }

    if (t[0] === document) {

        return JTS('html').outerWidth();

    }

    if (arguments.length !== 0) {

        t.each( (index, element) => {

            const e = JTS(element);
            const box = e.css('box-sizing');

            switch (box) {
                case 'border-box':
                    e.css('width', computeBorder(e));
                    break;
                case 'content-box':
                    e.css('width', value);
                    break;
                case 'padding-box':
                    e.css('width', computePadding(e));
                    break;

            }

        });

    }
    else {

        const e = JTS(t[0]);
        const border = parseFloat(e.css('border-left-width')) + parseFloat(e.css('border-right-width'));
        const padding = parseFloat(e.css('padding-left')) + parseFloat(e.css('padding-right'));

        return ((t[0].getBoundingClientRect().width - border) - padding);

    }

    function computeBorder(e) {

        const border = parseFloat(e.css('border-left-width')) + parseFloat(e.css('border-right-width'));
        const padding = parseFloat(e.css('padding-left')) + parseFloat(e.css('padding-right'));
        const gap = border + padding;

        if (typeof value === 'number') {

            return value + gap;

        }
        else {

            const suffix = (value.toString()).substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) + gap;

            }
            else {

                return 'calc(' + parseFloat(value) + '% + ' + gap + 'px)';

            }

        }

    }

    function computePadding(e) {

        const padding = parseFloat(e.css('padding-left')) + parseFloat(e.css('padding-right'));

        if (typeof value === 'number') {

            return value + padding;

        }
        else {

            const suffix = value.substring(value.length - 1);

            if (suffix === 'x') {

                return parseFloat(value) + padding;

            }
            else {

                return 'calc(' + parseFloat(value) + '% + ' + padding + 'px)';

            }

        }

    }

    return this;

};

JTS.prototype.worldMap = function(configuration: any){

    class ViewingTransformer {

        minimumScale;
        maximumScale;
        lowerScale;
        svg;
        vtm;

        constructor(minScale: number , maxScale: number , svg?: SVGElement) {

            this.minimumScale = minScale || 1;
            this.maximumScale = maxScale || 20;
            this.lowerScale = Math.floor(this.minimumScale * 100) / 100;
            this.svg = svg || document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            // This is the viewing transformation matrix, which starts at identity.
            this.vtm = this.createSVGMatrix();

        }

        /**
         * Helper method to create a new SVGMatrix instance.
         */
        createSVGMatrix() {

            return this.svg.createSVGMatrix();

        }

        scale(scaleX: number, scaleY: number, origin: any) {

            const possibleVtm = this.createSVGMatrix().
                translate(origin.x, origin.y).
                scale(scaleX, scaleY).
                translate(-origin.x, -origin.y).
                multiply(this.vtm);

            if (possibleVtm.a < this.minimumScale || possibleVtm.d < this.minimumScale){

                origin.x = 0;
                origin.y = 0;
                scaleX = this.minimumScale;
                scaleY = this.minimumScale;

                this.vtm = this.createSVGMatrix();

            }else if (possibleVtm.a > this.maximumScale || possibleVtm.d > this.maximumScale){

                return this.vtm;

            }
            // Order is important -- read this from the bottom to the top.
            // 1) Post multiply onto the current matrix.
            // 2) Translate such that the origin is at (0, 0).
            // 3) Scale by the provided factors at the origin.
            // 4) Put the origin back where it was.
            this.vtm = this.createSVGMatrix()
                .translate(origin.x, origin.y)
                .scale(scaleX, scaleY)
                .translate(-origin.x, -origin.y)
                .multiply(this.vtm);

            return this.vtm;

        }

        setZoomAndPosition(scaleX, scaleY , origin, translate){

            this.vtm = this.createSVGMatrix()
                .translate(origin.x, origin.y)
                .scale(scaleX, scaleY)
                .translate(-translate.x, -translate.y)
                .multiply(this.vtm);

            return this.vtm;

        }

        translateSvg(vX, vY, boundaries){

            const oldScaleX = this.vtm.a;
            const oldScaleY = this.vtm.d;

            if (Math.floor(oldScaleX * 100) / 100 === this.lowerScale || Math.floor(oldScaleY * 100) / 100 === this.lowerScale){

                return this.vtm;

            }

            this.vtm = this.createSVGMatrix()
                .translate(this.vtm.e + vX, this.vtm.f + vY);

            this.vtm.a = oldScaleX;
            this.vtm.d = oldScaleY;

            if (this.vtm.e > 0){

                this.vtm.e = 0;

            }

            if (this.vtm.e + boundaries.x < boundaries.xe){

                this.vtm.e = boundaries.xe - boundaries.x;

            }

            if (this.vtm.f > 0){

                this.vtm.f = 0;

            }

            if (this.vtm.f + boundaries.y < boundaries.ye){

                this.vtm.f = boundaries.ye - boundaries.y;

            }

            return this.vtm;

        }

    }

    const t = this;
    let resizeID = null;
    const mousedown = JTS.jMobile() ? 'touchstart' : 'mousedown';
    const mouseup = JTS.jMobile() ? 'touchend' : 'mouseup';
    const mousemove = JTS.jMobile() ? 'touchmove' : 'mousemove';
    let overMap = false;
    const zoomPosAndOrigin = [];

    addStyle();

    t.load(configuration.map_url, (content, index, element) => activateMap(index, element));

    function activateMap(index, element){

        addLabel();
        activate();

        function activate(){

            if (!JTS(element).attr('id')){

                JTS(element).attr('id', 'jts_world_map_' + configuration.ID + '_' + index);

            }

            JTS(element).attr('data-id', `${configuration.ID}-${index}`);

            if (configuration.styleClass){

                JTS(element).addClass(configuration.styleClass);

            }

            JTS(element).css({

                overflow : 'hidden'

            });

            zoomPosAndOrigin[index] = {

                zoom : 0,
                x : 0,
                y: 0

            };

            initializeElement(element);

            addListeners();

        }

        function addLabel(){

            const label = JTS(`<div class="world-map-label ts-font-helvetica" data-id="${configuration.ID}-${index}"></div>`);

            JTS('body').append(label);

        }

        function addListeners(){

            if (index === 0){

                JTS(window).bind('resize.world_map_events_' + configuration.ID, () => {

                    clearTimeout(resizeID);

                    resizeID = setTimeout( () => {

                        t.each((i, e) => {

                            disposeElement(e);
                            initializeElement(e);

                        });

                    }, 1500);

                });

                JTS(window).on(JTS.built_in_events.jEXTERNAL_RESIZE + '.world_map_events_' + configuration.ID, (e) => {

                    resizeID = setTimeout(  () => {

                        t.each( (i, parsed) => {

                            disposeElement(parsed);
                            initializeElement(parsed);

                        });

                    }, 1500);

                });

            }

        }

        function disposeElement(e) {

            JTS('#' + JTS(e).attr('id') + ' svg path').unbind('.world_map_events');
            JTS(e).unbind('.world_map_events');
            JTS('#' + JTS(e).attr('id') + '_plus').unbind('.world_map_events');
            JTS('#' + JTS(e).attr('id') + '_minus').unbind('.world_map_events');
            JTS('.world-map-controls').dispose();
            JTS(e).off(JTS.built_in_events.jWORLD_MAP_SET_ZOOM_AND_POSITION);

        }

        function globalToLocal(e, x, y){

            let parent = e;

            while (parent){

                x -= parent.offsetLeft;
                y -= parent.offsetTop;

                parent = parent.offsetParent;

            }

            return {x , y};

        }

        function initializeElement(currentElement){

            let minimumScale = 1;
            const maximumScale = configuration.maxScale ? configuration.maxScale : 20;
            let transform = false;

            const svg: any = document.querySelector('#' + JTS(element).attr('id') + ' svg');
            const g: any = document.querySelector('#' + JTS(element).attr('id') + ' svg g');
            let viewingTransformer = null;

            g.transform.baseVal.appendItem(g.transform.baseVal.createSVGTransformFromMatrix(svg.createSVGMatrix()));

            setSize();
            attachListeners();

            function addControls(){

                const controls = '<div class="world-map-controls ' +
                    (configuration.overrideControlsClass ? configuration.overrideControlsClass : '') +
                    (JTS.jMobile() ? ' controls-visible' : '') +
                    '" id="' + JTS(currentElement).attr('id') + '_controls' + '">' +
                    '<div class="minus ts-grid-fixed" id="' + JTS(currentElement).attr('id') + '_minus' + '"><i class="fa fa-minus"></i></div>' +
                    '<div class="plus ts-grid-fixed" id="' +
                    JTS(currentElement).attr('id') + '_plus' + '"><i class="fa fa-plus"></i></div>' +
                    '</div>';

                JTS(currentElement).append(controls);

            }

            function attachListeners(){

                JTS('#' + JTS(currentElement).attr('id') + ' svg path').bind('mouseover.world_map_events', function(e){

                    const name = JTS(this).attr('data-name');
                    const flag = configuration.flags_url + '/' + JTS(this).attr('data-flag');
                    const dataID = JTS(currentElement).attr('data-id');

                    overMap = true;

                    if (configuration.showLabel !== false){

                        JTS(`.world-map-label[data-id="${dataID}"]`).html('<div class="span ts-grid-fixed">' + name + '</div><div class="img ts-grid-fixed"><img alt="img" src="' + flag + '"></div>');
                        JTS(`.world-map-label[data-id="${dataID}"]`).css('opacity', 1);

                    }

                }).bind('mouseout.world_map_events', (e) => {

                    overMap = false;

                    if (configuration.showLabel !== false){

                        const dataID = JTS(currentElement).attr('data-id');

                        JTS(`.world-map-label[data-id="${dataID}"]`).css('opacity', 0);

                    }

                });

                JTS(currentElement).bind('mousewheel DOMMouseScroll MozMousePixelScroll.world_map_events', (e) => {

                    e.preventDefault();

                    // The zoom direction (in or out).
                    const dir = e.originalEvent.deltaY < 0 ? 1 : -1;

                    // How much to zoom, maintaining aspect ratio.
                    const scaleX = 1 + .1 * dir;
                    const scaleY = scaleX * svg.height.baseVal.value / svg.width.baseVal.value;

                    const coordinates = globalToLocal(currentElement, e.globalX, e.globalY);
                    // The mouse coordinates.
                    const origin = {

                        x: coordinates.x,
                        y: coordinates.y

                    };

                    // Get the new matrix.
                    const mat = viewingTransformer.scale(scaleX, scaleY, origin);

                    // Set the matrix on the group.
                    g.transform.baseVal.getItem(0).setMatrix(mat);


                });

                JTS('#' + JTS(currentElement).attr('id') + '_minus').bind(mousedown + '.world_map_events', (e) => {

                    transform = true;
                    transformSvg(0.9);

                }).bind(mouseup + '.world_map_events', (e) => {

                    transform = false;

                });

                JTS('#' + JTS(currentElement).attr('id') + '_plus').bind(mousedown + '.world_map_events', (e) => {

                    transform = true;
                    transformSvg(1.1);

                }).bind(mouseup + '.world_map_events', (e) => {

                    transform = false;

                });

                JTS(currentElement).bind(mousedown + '.world_map_events', (e) => {

                    let pointerX = JTS.jMobile() ? e.originalEvent.touches[0].clientX : e.globalX;
                    let pointerY = JTS.jMobile() ? e.originalEvent.touches[0].clientY : e.globalY;
                    let previousX = pointerX;
                    let previousY = pointerY;
                    let vX = 0;
                    let vY = 0;

                    if (!JTS(e.target).hasClass('minus') && !JTS(e.target).hasClass('plus')){

                        JTS(currentElement).addClass('world-draggable');
                        JTS(window).bind(mousemove + '.world_drag', (eW)  => {

                            pointerX = JTS.jMobile() ? eW.originalEvent.touches[0].clientX : eW.globalX;
                            pointerY = JTS.jMobile() ? eW.originalEvent.touches[0].clientY : eW.globalY;

                            vX = pointerX - previousX;
                            vY = pointerY - previousY;

                            previousX = pointerX;
                            previousY = pointerY;

                            panSvg(vX, vY);

                        }).bind(mouseup + '.world_drag',  (eW) => {

                            JTS(currentElement).removeClass('world-draggable');
                            JTS(window).unbind('.world_drag');

                        });

                    }

                }).bind('mouseover.world_map_events', (e) => {

                    JTS('#' + JTS(currentElement).attr('id') + '_controls').attr('active', true);

                }).bind('mouseout.world_map_events', (e) => {

                    JTS('#' + JTS(currentElement).attr('id') + '_controls').attr('active', false);

                });

                JTS(currentElement).bind(mousemove + '.world_map_events_' + + configuration.ID, (e) => {

                    if (overMap && configuration.showLabel !== false){

                        const dataID = JTS(currentElement).attr('data-id');

                        JTS(`.world-map-label[data-id="${dataID}"]`).css({

                            top : e.screenY,
                            left : e.screenX,

                        });

                    }

                });

                JTS(currentElement).on(JTS.built_in_events.jWORLD_MAP_SET_ZOOM_AND_POSITION, (e) => {

                    if (e.emitter[0] === currentElement){

                        setZoomAndPosition(e.data);

                    }

                });

                JTS(currentElement).emits(JTS.built_in_events.jWORLD_MAP_LOADED);

            }

            function panSvg(vX, vY) {

                const boundaries = {

                    x : JTS(g).outerWidth(),
                    y : JTS(g).outerHeight(),
                    xe : JTS(element).outerWidth(),
                    ye : JTS(element).outerHeight()

                };
                const mat = viewingTransformer.translateSvg(vX, vY, boundaries);

                g.transform.baseVal.getItem(0).setMatrix(mat);

            }

            function resetElement(){

                viewingTransformer = new ViewingTransformer(minimumScale, maximumScale);

                const origin = {

                    x: 0,
                    y: 0

                };

                const mat = viewingTransformer.scale(minimumScale, minimumScale, origin);

                g.transform.baseVal.getItem(0).setMatrix(mat);

                if (zoomPosAndOrigin[index].zoom !== 0){

                    setZoomAndPosition(zoomPosAndOrigin[index]);

                }

                addControls();

            }

            function setSize(){

                const WIDTH_REF = 725;
                const HEIGHT_REF = 360;
                const SCALE_REF = 0.8;

                const width = JTS(element).outerWidth();
                const height = width * (HEIGHT_REF / WIDTH_REF);

                minimumScale = SCALE_REF * (width / WIDTH_REF);

                JTS('#' + JTS(element).attr('id') + ' svg').attr({

                    width,
                    height,

                });

                resetElement();

            }

            function setZoomAndPosition(data) {

                const WIDTH_REF = 725;
                const HEIGHT_REF = 360;

                const scaleX = data.zoom > maximumScale ? maximumScale : data.zoom;
                const scaleY = scaleX * svg.height.baseVal.value / svg.width.baseVal.value;
                const translateX = (data.x * (svg.width.baseVal.value / WIDTH_REF)) - (svg.width.baseVal.value * 0.5);
                const translateY = (data.y  * (svg.height.baseVal.value / HEIGHT_REF)) - (svg.height.baseVal.value * 0.5);

                const origin = {

                    x : svg.width.baseVal.value * 0.5,
                    y : svg.height.baseVal.value * 0.5

                };

                const translate = {

                    x : translateX + (svg.width.baseVal.value * 0.5),
                    y : translateY + (svg.height.baseVal.value * 0.5)

                };

                viewingTransformer = new ViewingTransformer(minimumScale, maximumScale);

                const resetMat = viewingTransformer.scale(minimumScale, minimumScale, {x : 0 , y : 0});
                g.transform.baseVal.getItem(0).setMatrix(resetMat);

                const mat = viewingTransformer.setZoomAndPosition(scaleX, scaleY, origin, translate);
                g.transform.baseVal.getItem(0).setMatrix(mat);

                zoomPosAndOrigin[index] = data;

            }

            function transformSvg(scale){

                if (transform){


                    const scaleX = scale;
                    const scaleY = scaleX * svg.height.baseVal.value / svg.width.baseVal.value;

                    const origin = {

                        x: svg.width.baseVal.value * 0.5,
                        y: svg.height.baseVal.value * 0.5

                    };

                    const mat = viewingTransformer.scale(scaleX, scaleY, origin);

                    g.transform.baseVal.getItem(0).setMatrix(mat);

                    setTimeout(() => transformSvg(scale) , 16);

                }

            }

        }

    }

    function addStyle(){

        const zIndex = configuration.label_index || 100;
        const backGroundColor = configuration.label_background || '#0d0d0d';
        const color = configuration.label_color || '#f9f9f9';
        const borderRadius = configuration.label_radius || '5px';

        if (JTS('#world-map-style').length === 0){

            const style = '<style type="text/css" id="world-map-style">' +
                '.world-map-label{position: fixed;z-index: ' + zIndex + ';padding: 5px 20px;height: 50px; white-space: nowrap;background-color: ' + backGroundColor + ';opacity: 0;transition: opacity 0.5s ease-out;pointer-events: none;border-radius: ' + borderRadius + ';transform: translateX(-50%) translateY(-65px);}' +
                '.world-map-label div.span{padding:10px 0 0 0;height:40px;font-size: 15px;font-weight:600;color: ' + color + '}' +
                '.world-map-label div.img{overflow: hidden;width: 40px;height: 40px;margin-left: 10px;border-radius: 50%;position: relative;}' +
                '.world-map-label div.img img{position: absolute;width: 100%;height: 100%;object-fit: cover;}' +
                '.world-map-label:after{content: "";border: solid 15px transparent;border-top-color: #0d0d0d;position: absolute;bottom:-28px;left: calc(50% - 15px)}' +
                '.world-map-controls{position: absolute;z-index: 1;top: 10px; left: 10px;opacity: 0;transition: opacity 0.5s ease-out 1s;width: 70px;height: 30px;}' +
                '.world-map-controls[active]{opacity: 1;}' +
                '.world-map-controls .minus{width: 30px;height: 30px;border-radius: 50%;background-color: rgba(255,255,255,0.5);color:#0d0d0d;text-align: center;font-size: 18px;margin-right: 10px;cursor: pointer;padding: 5px 0 0 0;}' +
                '.world-map-controls .plus{width: 30px;height: 30px;border-radius: 50%;background-color: rgba(255,255,255,0.5);color:#0d0d0d;text-align: center;font-size: 18px;cursor: pointer;padding: 5px 0 0 0;}' +
                '.controls-visible{opacity: 1!important;}' +
                '.world-draggable{cursor: grabbing!important;}' +
                '</style>';

            JTS('head').append(style);

        }

    }

    return t;

};

JTS.prototype.wrap = function(element , single?) {

    const t = this;

    let jTSObject = [];
    const constructor = String(element.constructor);

    if (constructor.match(/\/\*JTS constructor fingerprint\*\//)) {

        jTSObject = element;

    }
    else {

        jTSObject = JTS(element);

    }

    if (jTSObject.length === 0) {

        console.log('JTS@wrap : can not create wrap element');

    }

    let parent = t.first().offsetPs()[0];
    let sibling = t.first()[0].previousElementSibling;
    let wrapper = jTSObject[0].cloneNode(true);
    let target = findChildren(wrapper);

    t.each( (i, e) => {

        if (!single){

            parent = JTS(e).offsetPs()[0];
            sibling = e.previousElementSibling;
            wrapper = jTSObject[0].cloneNode(true);
            target = findChildren(wrapper);

        }

        JTS(target).append(e);

        if (sibling){

            JTS(parent).append(wrapper, sibling);

        }
        else{

            JTS(parent).before(wrapper);

        }

    });

    function findChildren(node) {

        let flag = false;

        if (node.childNodes.length !== 0) {

            parseNode(0);

        }

        function parseNode(index){

            if (index < node.childNodes.length){

                if (node.childNodes[index].nodeType !== 3) {

                    flag = true;
                    node = node.childNodes[index];

                }else{

                    parseNode(index + 1);

                }

            }

        }

        if (flag) {

            return findChildren(node);

        }
        else {

            return node;

        }

    }

    return this;

};

JTS.prototype.zoom = function(zoomSize?: number , configuration?: any) {

    const t = this;

    const BORDER = 'solid 1px ' + (configuration && configuration.border_color ? configuration.border_color : '#efefef');
    const SIDE_HIGHLIGHTED = configuration && configuration.highlight_color ? '0px 0px 8px 0px ' +  configuration.highlight_color : '0px 0px 8px 0px rgba(255,137,0,1)';
    const UNDER_BAR_HEIGHT = 55;
    const IS_CLICK = 130;
    const BORDER_GAP = 15;
    const CANVAS_SIZE = 2024;
    const SQUARE_SIZE = zoomSize || 180;
    const BUTTON_SIZE = 512;
    const RESIZE_DELAY = 50;

    const sideImages = [];
    const sideImgElements = [];
    const imagesInfo = [];
    const srcDB =    [];
    const zoomID = new Date().getTime() + '_' + Math.floor(Math.random() * 500);

    let incrementalIndex = -1;

    t.each((i, e) => {

        if (e.tagName.toLowerCase() === 'img') {

            if (srcDB.indexOf(e.src) === -1) {

                incrementalIndex++;
                pushImage(incrementalIndex , e);

            }

            JTS(e).bind('click.jts_zoom_events_' + zoomID,  (event) => {

                addZoom(e, event);

            }).css('cursor', 'pointer');

        }

        function pushImage(index, element) {

            const imgC = document.createElement('div');
            const imgI = new Image();

            JTS(imgI).css({

                width: '100%',
                height: 'auto',
                position: 'relative'

            }).attr({

                alt: 'side_img',
                src: element.src,
                id: 'jts_zoom_side_img_' + index,
                index_ref: index

            }).addClass('jts_zoom_side_img');

            JTS(imgC).css({

                border: BORDER,
                height: 'auto',
                'margin-bottom': 5,
                cursor: 'pointer'

            }).attr('id', 'jts_zoom_side_container_' + index).addClass('col-pp-12 jts_zoom_side_img_container').append(imgI);

            srcDB.push(element.src);

            sideImages.push(imgC);
            sideImgElements.push(imgI);
            storeImgInfo(index, element);

        }

        function storeImgInfo(index, element) {

            const info: any = {};
            let name = e.src.split('/');

            name = name[name.length - 1];
            info.name = name;

            imagesInfo.push(info);

            if (JTS(element).attr('info_address')) {

                getInfo(JTS(element).attr('info_address'));

            }else if (JTS(element).attr('zoom_data')){

                const zoomInfo = JSON.parse(JTS(element).attr('zoom_data'));

                for (const n in zoomInfo) {

                    if (zoomInfo.hasOwnProperty(n)){

                        imagesInfo[index][n] = zoomInfo[n];

                    }

                }

            }
            else {

                setInfo();

            }

            function getInfo(address) {

                JTS.jJSON(address,  (d) => {
                    for (const n in d) {
                        if (d.hasOwnProperty(n)){
                            imagesInfo[i][n] = d[n];
                        }
                    }}, (error) => setInfo());

            }

            function setInfo() {

                JTS.jRequest(element.src, {

                    success: (d) => {

                        const b = new Blob([d]);

                        imagesInfo[index].size = b.size;

                    }

                });

            }

        }

    });

    function addZoom(e, event) {

        let imageIndex = srcDB.indexOf(e.src);
        const onMobile = JTS.jMobile();

        const container = document.createElement('div');
        const innerContainer = document.createElement('div');
        const rowUp = document.createElement('div');
        const rowDown = document.createElement('div');
        const sideBar = document.createElement('div');
        const containerLeftOuterBox = document.createElement('div');
        const containerRightOuterBox = document.createElement('div');
        const containerLeft = document.createElement('div');
        const containerRight = document.createElement('div');
        const square = document.createElement('div');
        const imageInfo = document.createElement('div');
        const imageCanvas: any = document.createElement('canvas');
        const brush = imageCanvas.getContext('2d');
        const dpr = 5;
        const underBar = document.createElement('div');
        const titleText = document.createElement('div');
        const previousButton: any = document.createElement('div');
        const nextButton: any = document.createElement('div');
        const disposeButton: any = document.createElement('div');

        const mousedown = onMobile ? 'touchstart' : 'mousedown';
        const mousemove = onMobile ? 'touchmove' : 'mousemove';
        const mouseup = onMobile ? 'touchend' : 'mouseup';
        const mouseover = onMobile ? 'touchstart' : 'mouseover';
        const mouseout = onMobile ? 'touchend' : 'mouseout';

        let startMT = 0;
        let endMT = 0;

        const leftIMG = new Image();

        JTS(container).css({

            'background-color': configuration && configuration.overlay_color ? configuration.overlay_color : 'rgba(0,0,0,0.6)',
            position: 'fixed',
            top: 0,
            left: 0,
            'z-index': 100

        });

        JTS(innerContainer).css({

            'background-color': 'rgb(255,255,255)',
            position: 'absolute',
            'border-radius': configuration &&
            (configuration.main_radius || configuration.main_radius === 0) ? configuration.main_radius : 5,
            height: 'auto',
            padding: 15,
            'box-shadow' : configuration && configuration.main_shadow ? configuration.main_shadow : '2px 2px 10px 0px rgba(0,0,0,0.6)'

        });

        JTS([rowUp, rowDown]).addClass('row');

        JTS(sideBar).css({

            border: BORDER,
            'border-radius': configuration && (configuration.sub_radius || configuration.sub_radius === 0) ? configuration.main_radius : 5,

        }).addClass('ts-hide-pp col-pl-1');



        JTS(containerLeft).css({

            border: BORDER,
            'border-radius': configuration && (configuration.sub_radius || configuration.sub_radius === 0) ? configuration.sub_radius : 5,
            'box-shadow' : configuration && configuration.sub_shadow ? configuration.sub_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)'

        }).addClass('col-pp-12');

        JTS(containerRight).css({

            border: BORDER,
            'border-radius': configuration && (configuration.sub_radius || configuration.sub_radius === 0) ? configuration.sub_radius : 5,
            'box-shadow' : configuration && configuration.sub_shadow ? configuration.sub_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)'

        }).addClass('col-pp-12');

        JTS(containerLeftOuterBox).css({

            'margin-bottom': 15,
            overflow : 'visible'

        }).addClass('col-pp-12 col-pl-5h ts-hpd-5').append(containerLeft);

        JTS(containerRightOuterBox).css({

            'margin-bottom': 15,
            overflow : 'visible'

        }).addClass('col-pp-12 col-pl-5h ts-hpd-5').append(containerRight);

        JTS(square).css({

            'background-color': configuration && configuration.square_color ? configuration.square_color : 'rgba(255,137,0,0.3)',
            visibility: 'hidden',
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            position: 'absolute',
            'z-index': 10

        }).attr({

            id: 'jts_zoom_square'

        });

        JTS(underBar).css({

            height: UNDER_BAR_HEIGHT,
            overflow: 'visible'

        }).addClass('col-pp-12');

        JTS(leftIMG).css({

            position: 'absolute',
            border: BORDER

        }).attr({

            alt: 'left_img',
            src: srcDB[imageIndex]

        }).addClass('jts_zoom_left_img');

        imageCanvas.width = CANVAS_SIZE;
        imageCanvas.height = CANVAS_SIZE;
        previousButton.width = BUTTON_SIZE;
        previousButton.height = BUTTON_SIZE;
        nextButton.width = BUTTON_SIZE;
        nextButton.height = BUTTON_SIZE;
        disposeButton.width = BUTTON_SIZE;
        disposeButton.height = BUTTON_SIZE;

        JTS(imageCanvas).css({

            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'none',
            'z-index': 1

        }).addClass('jts_zoom_canvas');

        JTS(imageInfo).css({

            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            padding: Math.floor(BORDER_GAP * 0.5),
            'z-index': 0

        }).addClass('jts_zoom_info');

        JTS(titleText).css({

            height: '100%',
            'margin-right': 10,
            'margin-left': 10,
            padding: 7,
            'font-size': 30

        }).addClass('ts-hide-pp col-pl-6 col-tab-7').addClass(configuration && configuration.font_class ? configuration.font_class : 'ts-font-helvetica' );

        JTS(previousButton).css({

            width: UNDER_BAR_HEIGHT,
            height: '100%',
            'margin-right': 10,
            'border-radius': configuration && (configuration.sub_radius || configuration.sub_radius === 0) ? configuration.main_radius : 5,
            'box-shadow' : configuration && configuration.sub_shadow ? configuration.sub_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            'background-color' : configuration && configuration.buttons_background ? configuration.buttons_background : '#ebebeb',
            color : configuration && configuration.buttons_color ? configuration.buttons_color : '#000000',
            'text-align' : 'center',
            'font-size' : 30,
            padding : '13px 0px 0px 0px'

        }).addClass('ts-grid-fixed');

        JTS(nextButton).css({

            width: UNDER_BAR_HEIGHT,
            height: '100%',
            'margin-right': 10,
            'border-radius': configuration && (configuration.sub_radius || configuration.sub_radius === 0) ? configuration.main_radius : 5,
            'box-shadow' : configuration && configuration.sub_shadow ? configuration.sub_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            'background-color' : configuration && configuration.buttons_background ? configuration.buttons_background : '#ebebeb',
            color : configuration && configuration.buttons_color ? configuration.buttons_color : '#000000',
            'text-align' : 'center',
            'font-size' : 30,
            padding : '13px 0px 0px 0px'

        }).addClass('ts-grid-fixed');

        JTS(disposeButton).css({

            width: UNDER_BAR_HEIGHT,
            height: '100%',
            'border-radius': configuration && (configuration.sub_radius || configuration.sub_radius === 0) ? configuration.main_radius : 5,
            'box-shadow' : configuration && configuration.sub_shadow ? configuration.sub_shadow : '2px 2px 5px 0px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            'background-color' : configuration && configuration.dispose_background ? configuration.dispose_background : '#f12f0a',
            color : configuration && configuration.dispose_color ? configuration.dispose_color : '#f1f1f1',
            'text-align' : 'center',
            'font-size' : 30,
            padding : '13px 0px 0px 0px'

        }).addClass('ts-grid-fixed ts-grid-right');

        JTS(containerLeft).append([leftIMG, square]);
        JTS(containerRight).append([imageInfo, imageCanvas]);
        JTS(rowUp).append([sideBar, containerLeftOuterBox, containerRightOuterBox]);
        JTS(underBar).append([previousButton, nextButton, titleText, disposeButton]);
        JTS(rowDown).append(underBar);
        JTS(innerContainer).append([rowUp, rowDown]);
        JTS(container).append(innerContainer);
        JTS('body').append(container);

        setSize();
        setListeners();

        JTS(sideBar).append(sideImages).scrollingLiquidBox(false, {

            padding: 5,
            scroll_marker_background: configuration && configuration.scroll_color ? configuration.scroll_color : 'rgba(165,165,165,0.5)',
            scroll_marker_width: 10

        });

        setAddedListeners();
        loadInfo();
        drawButtons();

        function canvasDraw(x, y, z) {

            const mX = x - leftIMG.offsetLeft;
            const mY = y - leftIMG.offsetTop;

            const width = JTS(leftIMG).outerWidth();
            const height = JTS(leftIMG).outerHeight();

            const oW = sideImgElements[imageIndex].naturalWidth || sideImgElements[imageIndex].width;
            const oH = sideImgElements[imageIndex].naturalHeight || sideImgElements[imageIndex].height;

            const cropX = mX * (oW / width);
            const cropY = mY * (oH / height);
            const cropW = z * (oW / width);
            const cropH = z * (oH / height);

            JTS(imageCanvas).css('display', 'block');

            /*
            CANVAS RULE : the crop pixels are stretched to CANVAS.width and CANVAS.height ,
            after stretched to CANVAS css width and height
            */

            brush.fillStyle = '#ffffff';

            brush.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            brush.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
            brush.drawImage(sideImgElements[imageIndex], cropX, cropY, cropW, cropH, 0, 0, imageCanvas.width, imageCanvas.height);

        }

        function displayInfo(info) {

            let index = 0;
            const box = document.createElement('div');

            JTS(box).css({

                position: 'relative',
                width: '100%',
                height: '100%',
                border: BORDER

            }).attr('id', 'jts_zoom_info_' + zoomID);

            const table: any = document.createElement('table');

            table.cellSpacing = 0;
            table.cellPadding = 5;

            for (const n in info) {

                if (info.hasOwnProperty(n)){

                    const tr = document.createElement('tr');
                    const tdLeft = document.createElement('td');
                    const tdCenter = document.createElement('td');
                    const tdRight = document.createElement('td');

                    const value = String(info[n]);

                    JTS(tdLeft).html(n).css({

                        'vertical-align': 'top',
                        'font-size': 23

                    }).addClass(configuration && configuration.font_class ? configuration.font_class : 'ts-font-helvetica');

                    JTS(tdCenter).html(':').css({

                        'vertical-align': 'top',
                        'font-size': 21

                    });

                    JTS(tdRight).html(value).css({

                        'vertical-align': 'top',
                        'font-size': 16,
                        'font-style': 'italic',
                        'padding-top': 9,
                        width: '100%'
                    });

                    JTS(tr).append([tdLeft, tdCenter, tdRight]).css({

                        'background-color': index % 2 === 0 ? '#f1f1f1' : '#e1e1e1'

                    });

                    JTS(table).append(tr);

                    index++;

                }

            }

            JTS(table).css({

                border: 'none',

            }).addClass('ts-font-helvetica');

            JTS(box).append(table);
            JTS(imageInfo).html(box);

            JTS('#jts_zoom_info_' + zoomID).scrollingLiquidBox(false, {

                scroll_marker_background: configuration &&
                configuration.scroll_color ? configuration.scroll_color : 'rgba(165,165,165,0.5)',
                scroll_marker_width : 10

            });

            JTS(titleText).html(String(info.name));

        }

        function dispose() {

            JTS(window).unbind('.jts_zoom_events_' + zoomID);
            JTS('.jts_zoom_side_img').unbind('.jts_zoom_events_' + zoomID);
            JTS(leftIMG).unbind('.jts_zoom_events_' + zoomID);
            JTS(square).unbind('.jts_zoom_events_' + zoomID);
            JTS(previousButton).unbind('.jts_zoom_events_' + zoomID);
            JTS(nextButton).unbind('.jts_zoom_events_' + zoomID);
            JTS(disposeButton).unbind('.jts_zoom_events_' + zoomID);
            JTS('.jts_zoom_side_img_container').css('box-shadow', 'none');

            JTS(container).dispose();

        }

        function drawButtons() {

            JTS('#jts_zoom_side_container_' + imageIndex).css('box-shadow', SIDE_HIGHLIGHTED);

            JTS(previousButton).html('').append('<i class="fa fa-step-backward"></i>');
            JTS(nextButton).html('').append('<i class="fa fa-step-forward"></i>');
            JTS(disposeButton).html('').append('<i class="fa fa-times-circle"></i>');

        }

        function getInnerWidth(w) {

            const MARKER = [0, 415, 737, 1025, 1981, 10000];
            const SIZE = [w - 65, w - 40, w - 40, w - 100, w - 200];

            for (let i = 0 ; i < MARKER.length - 1 ; i++) {

                if (w >= MARKER[i] && w < MARKER[i + 1]) {

                    return SIZE[i];

                }

            }

        }

        function getSquarePos(parsedE) {

            const data: any = {};

            let x = onMobile ? parsedE.touches[0].clientX : parsedE.screenX;
            let y = onMobile ? parsedE.touches[0].clientY : parsedE.screenY;

            let currentContainer = parsedE.target.offsetParent;

            while (currentContainer) {

                x -= currentContainer.offsetLeft;
                y -= currentContainer.offsetTop;

                currentContainer = currentContainer.offsetParent;

            }

            data.x = x;
            data.y = y;

            return data;

        }

        function gotoNextImage() {

            let nIndex = imageIndex;

            for (let i = nIndex + 1 ; i < sideImages.length ; i++) {

                if (sideImages[i]) {

                    nIndex = i;
                    break;

                }

            }

            if (nIndex === imageIndex) {

                return;

            }

            setNextImage(nIndex);
            setLeftIMG();
            loadInfo();

        }

        function gotoPreviousImage() {

            let nIndex = imageIndex;

            for (let i = nIndex - 1 ; i >= 0 ; i--) {

                if (sideImages[i]) {

                    nIndex = i;
                    break;

                }

            }

            if (nIndex === imageIndex) {

                return;

            }

            setNextImage(nIndex);
            setLeftIMG();
            loadInfo();

        }

        function loadInfo() {

            displayInfo(imagesInfo[imageIndex]);

        }

        function setAddedListeners() {

            JTS('.jts_zoom_side_img').bind(mousedown + '.jts_zoom_events_' + zoomID, (innerEvent) => startMT = innerEvent.time);

            JTS('.jts_zoom_side_img').bind(mouseup + '.jts_zoom_events_'  + zoomID,
                (innerEvent) => {

                    endMT = innerEvent.time;

                    if (endMT - startMT <= IS_CLICK) {

                        setNextImage(parseInt(JTS(innerEvent.target).attr('index_ref'), null));
                        setLeftIMG();
                        loadInfo();

                    }

                });

            JTS(leftIMG).bind(mouseover + '.jts_zoom_events_' + zoomID,
                (innerEvent) => {

                    JTS(square).css('visibility', 'visible');

                    setSquarePos(innerEvent);

                    JTS(window).bind(mouseout + '.jts_zoom_events_' + zoomID,
                        (wE) => {

                            if (wE.relatedTarget !== leftIMG && wE.relatedTarget !== square) {

                                JTS(window).unbind(mouseout + '.jts_zoom_events_' + zoomID);

                                JTS(square).css('visibility', 'hidden');
                                JTS(imageCanvas).css('display', 'none');

                            }

                        });

                });

            JTS([leftIMG, square]).bind(mousemove + '.jts_zoom_events_' + zoomID,
                (innerEvent) => {

                    if (innerEvent.target === leftIMG || innerEvent.target === square) {

                        innerEvent.preventDefault();
                        setSquarePos(innerEvent);

                    }

                });

            JTS(previousButton).bind('click.jts_zoom_events_' + zoomID, (innerEvent) => gotoPreviousImage() );

            JTS(nextButton).bind('click.jts_zoom_events_' + zoomID, (innerEvent) => gotoNextImage());

            JTS(disposeButton).bind('click.jts_zoom_events_' + zoomID, (innerEvent) => dispose());

        }

        function setLeftIMG() {

            const containerW = JTS(containerLeft).outerWidth();
            const containerH = JTS(containerLeft).outerHeight();

            const oW = sideImgElements[imageIndex].naturalWidth || sideImgElements[imageIndex].width;
            const oH = sideImgElements[imageIndex].naturalHeight || sideImgElements[imageIndex].height;

            const data: any = getSizeData(containerW - BORDER_GAP, containerH - BORDER_GAP);

            JTS(leftIMG).css(data);

            const squareSize = data.width < SQUARE_SIZE ||
            data.height < SQUARE_SIZE ? (data.width > data.height ? data.height : data.width) : SQUARE_SIZE;

            JTS(square).css({

                width: squareSize,
                height: squareSize

            });

            function getSizeData(width, height) {

                const currentData: any = {};

                let w;
                let h;

                if (oW > oH) {

                    getHeight(width);

                }
                else {

                    getWidth(height);

                }

                if (w > oW && h > oH) {

                    w = oW;
                    h = oH;

                }

                currentData.width = Math.round(w);
                currentData.height = Math.round(h);
                currentData.left = Math.floor((containerW * 0.5) - (w * 0.5));
                currentData.top = Math.floor((containerH * 0.5) - (h * 0.5));

                function getHeight(val) {

                    w = val;
                    h = oH * (w / oW);

                    if (h > height) {

                        getHeight(val - 1);

                    }

                }

                function getWidth(val) {

                    h = val;
                    w = oW * (h / oH);

                    if (w > width) {

                        getWidth(val - 1);

                    }

                }

                return currentData;

            }

        }

        function setListeners() {

            JTS(window).bind('resize.jts_zoom_events_' + zoomID, () => setSize());

        }

        function setNextImage(nIndex) {

            JTS('#jts_zoom_side_container_' + imageIndex).css('box-shadow', 'none');

            imageIndex = nIndex;

            JTS('#jts_zoom_side_container_' + imageIndex).css('box-shadow', SIDE_HIGHLIGHTED);
            JTS(leftIMG).attr('src', srcDB[imageIndex]);

        }

        function setSize() {

            const w = JTS(window).width();
            const h = JTS(window).height();

            JTS(container).css({

                width: w,
                height: h

            });

            const innerW = getInnerWidth(w);

            JTS(innerContainer).css({

                width: innerW,
                left: (w * 0.5) - (innerW * 0.5)

            });

            JTS([sideBar, containerLeft, containerRight]).css('height', JTS(containerLeft).outerWidth());

            setLeftIMG();

            imageCanvas.width = JTS(containerRight).outerWidth() * dpr;
            imageCanvas.height = JTS(containerRight).outerHeight() * dpr;

            const innerY = (h * 0.5) - (JTS(innerContainer).outerHeight() * 0.5);

            JTS(innerContainer).css('top', innerY);

            /*this should solve side handle issues*/
            setTimeout( () => JTS(window).emits(JTS.built_in_events.jLIQUID_BOX_RESIZE), RESIZE_DELAY);

        }

        function setSquarePos(parsedEvent) {

            const squarePos = getSquarePos(parsedEvent);
            const squareSize = JTS(square).outerWidth();

            let x = squarePos.x - (squareSize * 0.5);
            let y = squarePos.y - (squareSize * 0.5);

            const leftBound = leftIMG.offsetLeft;
            const rightBound = leftBound + JTS(leftIMG).outerWidth();
            const topBound = leftIMG.offsetTop;
            const bottomBound = topBound + JTS(leftIMG).outerHeight();

            x = x < leftBound ? leftBound : (x + squareSize > rightBound ? rightBound - squareSize : x);
            y = y < topBound ? topBound : (y + squareSize > bottomBound ? bottomBound - squareSize : y);

            JTS(square).css({

                left: x,
                top: y

            });

            canvasDraw(x, y, squareSize);

        }

    }

    return this;

};

JTS.jAnimate = (duration,  draw, options) => {

    const start = performance.now();
    const n = options.coefficient || 1;
    let timing;

    switch (options.timing_function){

        case 'linear' :
            timing = linear;
            break;
        case 'accelerate' :
            timing = accelerate;
            break;
        case 'arc' :
            timing = arc;
            break;
        case 'bowShooting' :
            timing = bowShooting;
            break;
        case 'bounce' :
            timing = bounce;
            break;
        case 'elastic' :
            timing = elastic;
            break;
        default :
            timing = linear;
            break;

    }

    if (options.ease_out){

        timing = makeEaseOut(timing);

    }else if (options.ease_in_out){

        timing = makeEaseInOut(timing);

    }

    requestAnimationFrame(function animate(time){

        let fraction = (time - start) / duration;

        if (fraction > 1){

            fraction = 1;

        }

        let progress = timing(fraction, n);

        if (options.reverse){

            progress = 1 - progress;

        }

        draw(progress);

        if (fraction < 1){

            requestAnimationFrame(animate);

        }else{

            if(options.callback){

                options.callback();

            }

        }

    });

    function linear(fraction){

        return fraction;

    }

    function accelerate(fraction, m) {

        return Math.pow(fraction, m);

    }

    function arc(fraction) {

        return 1 - Math.sin(Math.acos(fraction));

    }

    function bowShooting(fraction , m) {

        return Math.pow(fraction, 2) * ((m + 1) * fraction - m);

    }

    function bounce(fraction) {

        for (let a = 0, b = 1, result; 1; a += b, b /= 2) {

            if (fraction >= (7 - 4 * a) / 11) {

                return -Math.pow((11 - 6 * a - 11 * fraction) / 4, 2) + Math.pow(b, 2);

            }

        }

    }

    function elastic(fraction , m) {

        return Math.pow(2, 10 * (fraction - 1)) * Math.cos(20 * Math.PI * m / 3 * fraction);

    }

    function makeEaseOut(animation) {

        return (fraction , m) => {

            return 1 - animation(1 - fraction , m);

        };

    }

    function makeEaseInOut(animation) {

        return (fraction , m) => {

            if (fraction < .5){

                return animation(2 * fraction , m) / 2;

            }else{

                return (2 - animation(2 * (1 - fraction) , m)) / 2;

            }

        };

    }

};

JTS.jBrowser = () => {

    let browser;

    if (navigator.userAgent.indexOf('Firefox') !== -1) {

        browser = 'firefox';

    }
    else if (navigator.userAgent.indexOf('Edg') !== -1) {

        browser = 'edge';

    }
    else if (navigator.userAgent.indexOf('Chrome') !== -1 &&
        navigator.userAgent.indexOf('Edg') === -1 &&
        navigator.userAgent.indexOf('OPR') === -1) {

        browser = 'chrome';

    }
    else if (navigator.userAgent.indexOf('OPR') !== -1) {

        browser = 'opera';

    }
    else if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {

        browser = 'safari';

    }
    else if (navigator.userAgent.indexOf('Trident') !== -1) {

        browser = 'IE';
    }

    return browser;

};

JTS.jImages = (loaderFile: string) => {

    const container = document.createElement('div');

    JTS.jJSON(loaderFile, load);

    function load(data) {

        let array;

        for (const name of data) {

            if (data.hasOwnProperty(name)){

                array = data[name];

                loadImage(0);

            }

        }

        function loadImage(index) {

            if (index < array.length) {

                const image = new Image();
                const src = array[index];

                image.src = String(name + array[index]);
                image.alt = String(new Date().getTime() + '_' + index);

                JTS(container).append(image);

                loadImage(index + 1);

            }


        }

        // this for real loading
        JTS(container).css('display', 'none').attr('id', 'jts_j_images_' + new Date().getTime());
        JTS('body').append(container);

    }

};

JTS.jJSON = (url: string, success, errorOrData?) => {

    const successCB = success;
    let errorCB = (e) => console.log(e);
    const postData = {};

    if (errorOrData) {

        errorCB = errorOrData;

    }

    /*if (arguments.length === 4) {

        errorCB = arguments[2];
        postData = arguments[3];

    }

    let form = new FormData();

    for (let n in postData) {

        if(postData.hasOwnProperty(n)){

            form.append(n, postData[n]);

        }

    }*/

    const r = new XMLHttpRequest();

    r.open('get', url);
    // r.setRequestHeader('X-CSRF-TOKEN', '');

    r.onreadystatechange = () => {

        if (r.readyState === 4) {

            if (r.status === 200) {

                let currentObject;

                try {


                    currentObject = JSON.parse(r.response);


                }
                catch (e) {

                    errorCB('JTS@jJSON : return only JSON format');

                }

                if (currentObject) {

                    successCB(currentObject);

                }

            }
            else {

                errorCB('JTS@jJSON : server error');

            }

        }

    };

    r.send(null);

};

JTS.jMobile = () => {

    return window.navigator.userAgent.indexOf('iPhone') !== -1 ||
        window.navigator.userAgent.indexOf('iPad') !== -1 ||
        window.navigator.userAgent.indexOf('Android') !== -1;

};

JTS.jRequest = (url: string, configuration?: any) => {

    const MAXIMUM_ATTEMPTS = 3;

    const method =    configuration && configuration.method ? configuration.method : 'get';
    const successCB = configuration && configuration.success ? configuration.success : (d) => console.log(d);
    const errorCB =   configuration && configuration.error ? configuration.error : (e) => console.log(e);
    const type =      configuration && configuration.type ? configuration.type : 'download';
    const data =      configuration && configuration.data ? configuration.data : {};
    const csrfToken = configuration && configuration.csrf_token ? configuration.csrf_token : null;
    let attempt =   configuration && configuration.attempt ? configuration.attempt : 0;

    let dataForm = null;

    if (method.toLowerCase() === 'post') {

        dataForm = new FormData();

        for (const n of data) {

            dataForm.append(n , data[n]);

        }

    }

    const r = new XMLHttpRequest();

    r.open(method, url);

    if (csrfToken){

        r.setRequestHeader('X-CSRF-TOKEN', csrfToken);

    }

    if (url.toLowerCase().match(/.jpg$/) || url.toLowerCase().match(/.jpg?/) ||
        url.toLowerCase().match(/.png$/) || url.toLowerCase().match(/.png?/) ||
        url.toLowerCase().match(/.tiff$/) || url.toLowerCase().match(/.tiff?/) ||
        url.toLowerCase().match(/.gif$/) || url.toLowerCase().match(/.gif?/)) {

        r.responseType = 'arraybuffer';

    }

    r.onreadystatechange = () => {

        if (r.readyState === 4) {

            if (r.status === 200 || r.status === 201) {

                successCB(r.response);

            }
            else {

                attempt += 1;

                if (attempt < MAXIMUM_ATTEMPTS){

                    console.log(`JTS@jReqquest : REQUEST ATTEMPT #${attempt} FAIL`);

                    configuration = configuration ? configuration : {};
                    configuration.attempt = attempt;

                    JTS.jRequest(url , configuration);

                }else{

                    errorCB('JTS@jRequest : server-error');

                }

            }

        }

    };

    r.addEventListener('loadstart',
        (e) => {

            JTS(window).emits(JTS.built_in_events.jREQUEST_START_EVENT, { original_event: e });

        });

    r.addEventListener('loadend',
         (e) => {

            JTS(window).emits(JTS.built_in_events.jREQUEST_END_EVENT, { original_event: e });

        });

    r.onerror = (error) => {

        attempt++;

        if (attempt < MAXIMUM_ATTEMPTS){

            console.log(`JTS@jRequest : REQUEST ATTEMPT #${attempt} FAIL`);

            configuration = configuration ? configuration : {};
            configuration.attempt = attempt;

            JTS.jRequest(url , configuration);

        }else{

            errorCB('JTS@jRequest : server-error');

        }

    };

    switch (type) {

        case 'download':
            r.onprogress = progress;
            break;
        case 'upload':
            r.upload.onprogress = progress;
            break;
        default:
            r.onprogress = progress;
            break;

    }

    try{

        r.send(dataForm);

    }catch (e){

        attempt += 1;

        if ( attempt < MAXIMUM_ATTEMPTS){

            console.log(`JTS@jRequest : REQUEST ATTEMPT #${attempt} FAIL`);

            configuration = configuration ? configuration : {};
            configuration.attempt = attempt;

            JTS.jRequest(url , configuration);

        }else{

            errorCB('JTS@jRequest : server-error');

        }

    }

    function progress(e) {

        JTS(window).emits(JTS.built_in_events.jREQUEST_PROGRESS_EVENT, {original_event: e});

    }

};

JTS.jSort = (list, sortFlags? , sortProperty?) => {

    for (let i = 0; i < 1 ; i++){

        for (let l = 1 ; l < list.length; l++) {

            if (typeof list[i] !== typeof list[l]) {

                console.log('JTS@jSort : can not sort multiple types');
                return list;

            }

        }

    }

    let direction =      'a';
    let caseSensitive =  'i';
    let oProperty =      null;

    if (sortFlags &&  typeof sortFlags === 'string') {

        const flags = sortFlags.split('|');

        for (let h = 0; h < flags.length; h++){

            flags[h] = flags[h].toLowerCase().trim();

        }


        if (flags[0] === 'a' || flags[0] === 'd') {

            direction = flags[0];

        }
        else if (flags[0] === 's' || flags[0] === 'i') {

            caseSensitive = flags[0];

        }

        if (flags[1] && (flags[1] === 'a' || flags[1] === 'd')) {

            direction = flags[1];

        }
        else if (flags[1] && (flags[1] === 's' || flags[1] === 'i')) {

            caseSensitive = flags[1];

        }

        if (flags.length === 1 && flags[0].length > 1 && typeof list[0] === 'object'){

            oProperty = flags[0];

        }

    }

    if (sortProperty && typeof sortProperty === 'string') {

        oProperty = sortProperty;

    }

    let value =  null;

    sortArray();

    function sortArray() {

        sort(0);

        function sort(index) {

            value = list[index];

            for (let i = index + 1 ; i < list.length ; i++) {

                const currentValue = list[i];

                const valueA = typeof list[0] === 'number' ?
                    value : (typeof list[0] === 'string' ? parseString(value) : getObjectValue(value));
                const valueB = typeof list[0] === 'number' ?
                    currentValue : (typeof list[0] === 'string' ? parseString(currentValue) : getObjectValue(currentValue));

                const a = direction === 'a' ? valueB : valueA;
                const b = direction === 'a' ? valueA : valueB;

                if (a == null || b == null){

                    return;

                }

                if (a < b) {

                    updateValue(i, index);

                }

            }

            if (index < list.length - 1) {

                sort(index + 1);

            }

        }

    }

    function getObjectValue(object) {

        if (typeof object !== 'object' || oProperty == null || object[oProperty] === undefined) {

            console.log('error-in-object-sorting @ jTS.jSort');
            return null;

        }

        return typeof object[oProperty] === 'string' ? parseString(object[oProperty]) : object[oProperty];

    }

    function parseString(currentString) {

        return caseSensitive === 's' ?  currentString : currentString.toLowerCase();

    }

    function updateValue(i, index) {

        value = list[i];

        list.splice(i, 1);
        list.splice(index, 0, value);

    }

    return list;

};

JTS.jStringSplice = (currentString, startIndex , contentOrLength) => {

    let parsed = '';

    if (typeof currentString !== 'string') {

        console.log('JTS@jStringSplice : incorrect string value');
        return;

    }

    if (typeof startIndex !== 'number') {

        console.log('JTS@jStringSplice : incorrect startIndex value');
        return;

    }

    if (typeof contentOrLength === 'string') {

        add();

    }
    else if (typeof contentOrLength === 'number') {

        dispose();

    }
    else {

        console.log('JTS@jStrinSplice : unexpected value');
        return;

    }

    function add() {

        const sIndex = startIndex < 0 ? 0 : startIndex;

        const first =  currentString.substr(0, sIndex);
        const second = currentString.substr(sIndex);

        parsed = first + contentOrLength + second;

    }

    function dispose() {

        const sIndex = startIndex < 0 ? 0 : startIndex;

        const first =  currentString.substr(0, sIndex);
        let second = currentString.substr(sIndex);

        second =  second.substr(contentOrLength);
        parsed =  first + second;

    }

    return parsed;

};





JTS.ts = function(set: Array<any>, selector: any){

    /*JTS constructor fingerprint*/

    for (const object of set) {

        this.push(object);

    }

    this.selector = selector;

};

JTS.ts.prototype = Object.create(JTS.prototype);
JTS.ts.prototype.constructor = JTS.ts;


JTS.boolean = {

    value_attribute: [
        'active',
        'async',
        /*'autocomplete',*/
        'autofocus',
        'autoplay',
        'checked',
        'compact',
        'contenteditable',
        'controls',
        'default',
        'defer',
        'disabled',
        'enabled',
        'expanded',
        'formNoValidate',
        'frameborder',
        'hidden',
        'indeterminate',
        'ismap',
        'loop',
        'multiple',
        'muted',
        'nohref',
        'noresize',
        'noshade',
        'novalidate',
        'nowrap',
        'open',
        'readonly',
        'required',
        'reversed',
        'scoped',
        'scrolling',
        'seamless',
        'selected',
        'sortable',
        'spellcheck',
        'translate'
    ]

};

JTS.built_in_events = {
    jCOLOR_PICKER_UPDATED : 'jColor_picker_updated',
    jCROPPER_DONE : 'jCropper_done',
    jCROPPER_ONLY_CLOSED : 'jCropper_only_closed',
    jEXTERNAL_RESIZE : 'jExternal_resize',
    jLIQUID_BOX_RESIZE : 'jLiquid_box_resize',
    jMASONRY_READY : 'jMasonry_ready',
    jMASONRY_RESIZE : 'jMasonry_resize',
    jPAGINATION_FILTER_SORT_ITEMS : 'jPagination_filter_sort_items',
    jPAGINATION_PAGE_CHANGE : 'jPagination_page_change',
    jPAGINATION_UPDATE_ITEMS : 'jPagination_update_items',
    jPARTICLES_FX_READY : 'jParticles_fx_ready',
    jREQUEST_END_EVENT : 'jRequest_end_event',
    jREQUEST_PROGRESS_EVENT : 'jRequest_progress_event',
    jREQUEST_START_EVENT : 'jRequest_start_event',
    jSHELL_RESIZE : 'jShell_resize',
    jSHOWCASE_ANIMATION_START : 'jShowcase_animation_start',
    jSHOWCASE_ANIMATION_END : 'jShowcase_animation_end',
    jSHOWCASE_CONTROLS_PRESSED : 'jShowcase_controls_pressed',
    jSHOWCASE_READY : 'jShowcase_ready',
    jTOUCH_SCROLL_STEP : 'jTouch_scroll_step',
    jWORLD_MAP_LOADED : 'jWorld_map_loaded',
    jWORLD_MAP_SET_ZOOM_AND_POSITION : 'jWorld_map_set_position'
};

JTS.cssMap = {
    'align-content': 'stretch',
    'align-items': 'stretch',
    'align-self': 'auto',
    all: 'none',
    animation: 'composed',
    'animation-delay': '0s',
    'animation-direction': 'normal',
    'animation-duration': '0s',
    'animation-fill-mode': 'none',
    'animation-iteration-count': '1',
    'animation-name': 'none',
    'animation-play-state': 'running',
    'animation-timing-function': 'ease',
    'backface-visibility': 'visible',
    background: 'composed',
    'background-attachment': 'scroll',
    'background-blend-mode': 'normal',
    'background-clip': 'border-box',
    'background-color': 'rgba(255,255,255,0)',
    'background-image': 'none',
    'background-origin': 'padding-box',
    'background-position': '0% 0%',
    'background-repeat': 'repeat',
    'background-size': 'auto',
    border: 'composed',
    'border-bottom': 'composed',
    'border-bottom-color': 'rgb(255,255,255)',
    'border-bottom-left-radius': '0px',
    'border-bottom-right-radius': '0px',
    'border-bottom-style': 'none',
    'border-bottom-width': '0px',
    'border-collapse': 'separate',
    'border-color': 'rgb(255,255,255)',
    'border-image': 'none',
    'border-image-outset': '0',
    'border-image-repeat': 'stretch',
    'border-smage-slice': '100%',
    'border-smage-source': 'none',
    'border-image-width': '1',
    'border-left': 'composed',
    'border-left-color': 'rgb(255,255,255)',
    'border-left-style': 'none',
    'border-left-width': '0px',
    'border-radius': '0px',
    'border-right': 'composed',
    'border-right-color': 'rgb(255,255,255)',
    'border-right-style': 'none',
    'border-right-width': '0px',
    'border-spacing': '2px',
    'border-style': 'none',
    'border-top': 'composed',
    'border-top-color': 'rgb(255,255,255)',
    'border-top-left-radius': '0px',
    'border-top-right-radius': '0px',
    'border-top-style': 'none',
    'border-top-width': '0px',
    'border-width': '0px',
    'box-decoration-break': 'slice',
    'box-shadow': 'none',
    'box-sizing': 'content-box',
    'caption-side': 'top',
    'caret-color': 'auto',
    clear: 'none',
    clip: 'auto',
    color: 'auto',
    'column-count': 'auto',
    'column-fill': 'balance',
    'column-gap': 'normal',
    'column-rule': 'composed',
    'column-rule-color': 'rgb(255,255,255)',
    'column-rule-style': 'none',
    'column-rule-width': '0px',
    'column-span': 'none',
    'column-width': 'auto',
    columns: 'auto auto',
    content: 'normal',
    'counter-increment': 'none',
    'counter-reset': 'none',
    cursor: 'auto',
    direction: 'ltr',
    display: 'auto',
    'empty-cells': 'show',
    filter: 'none',
    flex: 'composed',
    'flex-basis': 'auto',
    'flex-direction': 'row',
    'flex-flow': 'row nowrap',
    'flex-grow': '1',
    'flex-shrink': '1',
    'flax-wrap': 'nowrap',
    float: 'none',
    font: 'composed',
    'font-family': 'auto',
    'font-kerning': 'auto',
    'font-size': 'medium',
    'font-size-adjust': 'none',
    'font-stretch': 'normal',
    'font-style': 'normal',
    'font-variant': 'normal',
    'font-weight': 'normal',
    grid: 'composed',
    'grid-area': 'composed',
    'grid-auto-columns': 'auto',
    'grid-auto-flow': 'row',
    'grid-auto-rows': 'auto',
    'grid-column': 'composed',
    'grid-column-end': 'auto',
    'grid-column-gap': '0',
    'grid-column-start': 'auto',
    'grid-gap': 'composed',
    'grid-row': 'composed',
    'grid-row-end': 'auto',
    'grid-row-gap': '0',
    'grid-row-start': 'auto',
    'grid-template': 'composed',
    'grid-template-areas': 'none',
    'grid-template-columns': 'none',
    'grid-template-rows': 'none',
    'hanging-puntuaction': 'none',
    'justify-content': 'flex-start',
    'letter-spacing': 'normal',
    'line-height': 'normal',
    'line-style': 'composed',
    'line-style-image': 'none',
    'line-style-position': 'outside',
    'line-style-type': 'disc',
    'margin-bottom': '0px',
    'margin-left': '0px',
    'margin-right': '0px',
    'margin-top': '0px',
    'max-height': 'none',
    'max-width': 'none',
    'min-height': 'none',
    'min-width': 'none',
    'object-fit': 'fill',
    opacity: '1',
    order: '0',
    otuline: 'composed',
    'outline-color': 'invert',
    'outline-offset': '0',
    'outline-style': 'none',
    'outline-width': '0px',
    overflow: 'visible',
    'overflow-x': 'visible',
    'overflow-y': 'visible',
    'padding-bottom': '0px',
    'padding-left': '0px',
    'padding-right': '0px',
    'padding-top': '0px',
    'page-break-after': 'auto',
    'page-break-before': 'auto',
    'page-break-inside': 'auto',
    perspective: 'none',
    'perspective-origin': '50% 50%',
    'pointer-events': 'auto',
    position: 'static',
    quotes: 'none',
    resize: 'none',
    'tab-size': '8',
    'table-layout': 'auto',
    'text-align': 'left',
    'text-align-last': 'auto',
    'text-decoration': 'composed',
    'text-decoration-color': 'rgb(255,255,255)',
    'text-decoration-line': 'none',
    'text-decoration-style': 'solid',
    'text-indent': '0',
    'text-justify': 'auto',
    'text-overflow': 'clip',
    'text-shadow': 'none',
    'text-transform': 'none',
    transform: 'none',
    'transform-origin': '50% 50% 0',
    'transform-style': 'flat',
    transition: 'composed',
    'transition-delay': '0s',
    'transition-duration': '0s',
    'transition-property': 'all',
    'transition-timing-function': 'ease',
    'unicode-bidi': 'normal',
    'user-select': 'auto',
    'vertical-align': 'baseline',
    visibility: 'visible',
    'white-space': 'normal',
    'word-break': 'normal',
    'word-spacing': 'normal',
    'word-wrap': 'normal',
    'z-index': 'auto'

};

JTS.flow = {

    clearFlow() {

        for (const n in JTS.flow.listeners) {

            if (JTS.flow.listeners.hasOwnProperty(n)){

                if (JTS.flow.listeners[n].length === 0) {

                    delete JTS.flow.listeners[n];

                }

            }

        }

    },
    events : {},
    Event : class Event{
        changedTouches;
        ctrlKey;
        currentTarget;
        data;
        elementSetIndex;
        globalX ;
        globalY;
        keyCode;
        localX;
        localY;
        originalEvent;
        relatedTarget ;
        screenX;
        screenY;
        shiftKey;
        target;
        time;
        type;
        touches;
        preventDefault;
        stopImmediatePropagation;
        stopPropagation;
        isDefaultPrevented;
        isImmediatePropagationStopped;
        isPropagationStopped;
        constructor(e, listener, data){
            const t = this;
            this.changedTouches = e.changedTouches;
            this.ctrlKey = e.ctrlKey;
            this.currentTarget = listener.element;
            this.data = data;
            this.elementSetIndex = listener.index;
            this.globalX = e.pageX;
            this.globalY = e.pageY;
            this.keyCode = e.keyCode;
            this.localX = e.offsetX;
            this.localY = e.offsetY;
            this.originalEvent = e;
            this.relatedTarget = e.relatedTarget;
            this.screenX = e.clientX || e.x;
            this.screenY = e.clientY || e.y;
            this.shiftKey = e.shiftKey;
            this.target = e.target;
            this.time = new Date().getTime();
            this.type = e.type;
            this.touches = e.touches;

            this.preventDefault = () => e.preventDefault();
            this.stopImmediatePropagation = () => { e.stopImmediatePropagation(); e.immediatePropS = true; };
            this.stopPropagation = () => { e.stopPropagation(); e.propagationStopped = true; e.propagationSO = listener.element; };
            this.isDefaultPrevented = () => e.defaultPrevented;
            this.isImmediatePropagationStopped = () => e.immediatePropS;
            this.isPropagationStopped = () => e.propagationStopped;

            if (e.type === 'touchstart') {

                if (e.touches[0]) {

                    t.globalX = e.touches[0].pageX;
                    t.globalY = e.touches[0].pageY;
                    t.screenX = e.touches[0].clientX;
                    t.screenY = e.touches[0].clientY;

                    const localCoordinates = JTS(t.target).globalToLocalPoint(t.globalX , t.globalY);

                    t.localX = localCoordinates.x;
                    t.localY = localCoordinates.y;

                }

            }else if (e.type === 'touchmove'){

                if (e.touches[0]) {

                    t.globalX = e.touches[0].pageX;
                    t.globalY = e.touches[0].pageY;
                    t.screenX = e.touches[0].clientX;
                    t.screenY = e.touches[0].clientY;

                    const localCoordinates = JTS(t.target).globalToLocalPoint(t.globalX , t.globalY);

                    t.localX = localCoordinates.x;
                    t.localY = localCoordinates.y;

                }

            }else if (e.type === 'touchend'){

                if (e.changedTouches[0]) {

                    t.globalX = e.changedTouches[0].pageX;
                    t.globalY = e.changedTouches[0].pageY;
                    t.screenX = e.changedTouches[0].clientX;
                    t.screenY = e.changedTouches[0].clientY;

                    const localCoordinates = JTS(t.target).globalToLocalPoint(t.globalX , t.globalY);

                    t.localX = localCoordinates.x;
                    t.localY = localCoordinates.y;

                }

            }
        }
    },
    listeners : {},
    stackIndex : {}

};

JTS.jFlow = {

    jListeners: [],
    jEvent : class JEvent{
        type;
        emitter;
        currentTarget;
        data;
        constructor(type: string, emitter: any, currentTarget: any, data: object) {

            const t = this;

            this.type = type;
            this.emitter = emitter;
            this.currentTarget = currentTarget;
            this.data = data ? data : {};

        }
    },
    jStackIndex: 0,
    unbindIndex: 0

};

JTS.originalStyles = [];
