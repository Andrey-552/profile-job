

////////////////////////////Scroll
;(function() {
    'use strict';

    function ScrollBox(container, nameEvent, buttonTop) {
        // имя события прокрутки
        this.nameEvent = nameEvent;
        // родительский элемент в котором находится контент и скроллбар
        this.viewport = container.querySelector('.viewport');
        // элемент с контентом
        this.content = this.viewport.querySelector('.content');
        // высоты полученных элементов
        this.viewportHeight = this.viewport.offsetHeight;
        this.contentHeight = this.content.scrollHeight;
        // возможная максимальная прокрутка контента
        this.max = this.viewport.clientHeight - this.contentHeight;
        // соотношение между высотами вьюпорта и контента
        this.ratio = this.viewportHeight / this.contentHeight;
        // минимальная высота ползунка скроллбара
        this.scrollerHeightMin = 25;
        // шаг прокручивания контента при наступлении события 'wheel'
        // чем меньше шаг, тем медленнее и плавнее будет прокручиваться контент
        this.step = 20;
        // флаг нажатия на левую кнопку мыши
        this.pressed = false;
    }

    // для сокращения записи, создадим переменную, которая будет ссылаться
    // на прототип 'ScrollBox'
    const fn = ScrollBox.prototype;

    fn.init = function() {
        // если высота контента меньше или равна высоте вьюпорта,
        // выходим из функции
        if (this.viewportHeight >= this.contentHeight) return;
        // формируем полосу прокрутки и полунок
        this.createScrollbar();
        // устанавливаем обработчики событий
        this.registerEventsHandler();
    };

    fn.createScrollbar = function() {
        // создаём новые DOM-элементы DIV из которых будет
        // сформирован скроллбар
        let buttonScroller = document.querySelector('.viewport-wrapper');;
        let polyfillMargin = document.querySelector('.left__bottom-polyfill');;
        let scrollbar = document.createElement('div'),
            buttonTopDiv = document.createElement('div'),
            buttonTopImg = document.createElement('img'),
            buttonBottomDiv = document.createElement('div'),
            buttonBottomImg = document.createElement('img'),
            scroller = document.createElement('div');

        // присваиваем созданным элементам соответствующие классы
        scrollbar.className = 'scrollbar';
        scroller.className = 'scroller';
        buttonTopDiv.className = 'button-top button2';
        buttonBottomDiv.className = 'button-bottom button2';

        // вставляем созданные элементы в document
        buttonTopImg.src = "assets/img/svg/select-triangle2.svg";
        buttonBottomImg.src = "assets/img/svg/select-triangle2.svg";
        buttonTopDiv.appendChild(buttonTopImg);
        buttonBottomDiv.appendChild(buttonBottomImg);
        polyfillMargin.replaceWith(buttonTopDiv);
        buttonScroller.after(buttonBottomDiv);
        scrollbar.appendChild(scroller);
        this.viewport.appendChild(scrollbar);

        // получаем DOM-объект ползунка полосы прокрутки, вычисляем и
        // устанавливаем его высоту
        this.scroller = this.viewport.querySelector('.scroller');
        this.scrollerHeight = parseInt(this.ratio * this.viewportHeight);
        this.scrollerHeight = (this.scrollerHeight < this.scrollerHeightMin) ? this.scrollerHeightMin : this.scrollerHeight;
        //this.scroller.style.height = this.scrollerHeight + 'px';
        // вычисляем максимально возможное смещение ползунка от верхней границы вьюпорта
        // это смещение зависит от высоты вьюпорта и высоты самого ползунка////////////
        this.scrollerMaxOffset = this.viewportHeight - this.scroller.offsetHeight;


    };

    // регистрация обработчиков событий
    fn.registerEventsHandler = function(e) {
        // вращение колёсика мыши
        if (this.nameEvent === 'wheel') {
            this.viewport.addEventListener('wheel', this.scroll.bind(this));
        } else {
            this.content.addEventListener('scroll', () => {
                this.scroller.style.top = (this.content.scrollTop * this.ratio) + 'px';

            });
        }

        // нажатие на левую кнопку мыши
        this.scroller.addEventListener('mousedown', e => {
            // координата по оси Y нажатия левой кнопки мыши
            this.start = e.clientY;
            // устанавливаем флаг, информирующий о нажатии левой кнопки мыши
            this.pressed = true;
        });

        // перемещение мыши
        document.addEventListener('mousemove', this.drop.bind(this));

        // отпускание левой кнопки мыши
        document.addEventListener('mouseup', () => this.pressed = false);
    };

    fn.scroll = function(e) {
        e.preventDefault();
        // направление вращения колёсика мыши
        let dir = -Math.sign(e.deltaY);
        // шаг прокручивания контента, в зависимости от прокручивания
        // колёсика мыши
        let	step = (Math.abs(e.deltaY) >= 3) ? this.step * dir : 0;

        // управляем позиционированием контента
        this.content.style.top = (this.content.offsetTop + step) + 'px';

        // ограничиваем прокручивание контента вверх и вниз
        if (this.content.offsetTop > 0) this.content.style.top = '0px';
        if (this.content.offsetTop < this.max) this.content.style.top = this.max + 'px';

        // перемещаем ползунок пропорционально прокручиванию контента
        this.scroller.style.top = (-this.content.offsetTop * this.ratio) + 'px';
    };

    fn.drop = function(e) {
        e.preventDefault();
        // если кнопка мыши не нажата, прекращаем работу функции
        if (this.pressed === false) return;

        // величина перемещения мыши
        let shiftScroller = this.start - e.clientY;

        // изменяем положение бегунка на величину перемещения мыши
        this.scroller.style.top = (this.scroller.offsetTop - shiftScroller) + 'px';
        // console.log(this.scroller.offsetTop);

        // ограничиваем перемещение ползунка по верхней границе вьюпорта//////////////////
        if (this.scroller.offsetTop <= 0) this.scroller.style.top = '0px';
        // ограничиваем перемещение ползунка по нижней границе вьюпорта
        // сумма высоты ползунка и его текущего отступа от верхней границы вьюпорта
        let	totalHeight = this.scroller.offsetHeight + this.scroller.offsetTop;
        if (totalHeight >= this.viewportHeight) this.scroller.style.top = this.scrollerMaxOffset + 'px';

        // расстояние, на которую должен переместиться контент
        // это расстояние пропорционально смещению ползунка
        let	shiftContent = this.scroller.offsetTop / this.ratio;
        // прокручиваем контент по событию 'wheel'
        if (this.nameEvent === 'wheel') {
            // прокручиваем контент на величину пропорциональную перемещению ползунка,
            // она имеет обратный знак, т.к. ползунок и контент прокручиваются
            // в противоположных направлениях
            this.content.style.top = -shiftContent + 'px';
            // прокручиваем контент по событию 'scroll'
        } else {
            this.content.scrollTo(0, shiftContent);
        }
        // устанавливаем координату Y начала движения мыши равной текущей координате Y
        this.start = e.clientY;
    };

    // выбираем все блоки на странице, в которых может понадобиться
    // прокрутка контента
    const containers = document.querySelectorAll('[data-control]');
    // перебираем полученную коллекцию элементов
    for (const container of containers) {
        // имя события, используемого для прокручивания контента
        let nameEvent = container.getAttribute('data-control');
        // с помощью конструктора 'ScrollBox' создаём экземпляр объекта,
        // в котором будем прокручивать контент
        let scrollbox = new ScrollBox(container, nameEvent);
        // создание скроллбара, исходя из полученных в конструкторе высот
        // контента и вьюпорта текущего блока, регистрация обработчиков событий
        scrollbox.init();
    }


})();

////////////////////////////Scrollbar button
;(function() {
    'use strict';

let clickButton = () =>{
    // click button
    let button2 = document.querySelectorAll('.button2');
    let viewport = document.querySelector('.viewport');
    // элемент с контентом
    let content = document.querySelector('.content-button');

    button2.forEach(item=>{
        item.addEventListener('click', function (e) {
            let attr = e.currentTarget.getAttribute('class');

            if(attr === 'button-bottom button2') {
                //content.scrollTop += 25;
                content.scrollBy(0, 25);
            }

            if(attr === 'button-top button2') {
                content.scrollBy(0, -25);
            }

        })
    })

};
clickButton();
})();

//////////////////////////Select custom
;(function() {
    'use strict';

let select = function () {
    let selectHeader = document.querySelectorAll('.select__header');
    let selectItem = document.querySelectorAll('.select__item');

    selectHeader.forEach(item => {
        item.addEventListener('click', selectToggle)
    });

    function selectToggle() {
        this.parentElement.classList.toggle('is-active');
    }

};
select();
})();


/////////////////Toggle Menu
;(function() {
    'use strict';

    let menuToggle = function () {
        let navMenu = document.querySelector('.nav-toggle');
        let toggleBtn = document.querySelectorAll('.menu-toggle');
        let menuClose = document.querySelectorAll('.close-btn-menu');

        toggleBtn.forEach(item =>{
            item.addEventListener('click', getMenuBtn)
        });

        function getMenuBtn () {
            navMenu.style.width = '280px'
        }

        menuClose.forEach(item =>{
            item.addEventListener('click', closeMenuBtn)
        });

        function closeMenuBtn () {
            navMenu.style.width = '0'
        }



    };
    menuToggle();
})();


///Preloader
(function() {
    'use strict';
window.onload = function () {
    let preloaderSite = document.querySelector('.preloader1-site');
    preloaderSite.style.display = 'none';
};
})();
///////////////////////////////////////////////////////////////////
    // Custom JS

///XMLHttpRequest
(function() {
    'use strict';



   //путь до json файлов
    const countryURL = 'http://dist/country';
    const leagueURL = 'http://dist/league';
    const matchURL = 'http://dist/match';



    //Только для GET
    function  sendRequest(method, url) {
        return new Promise( (resolve, reject) =>{
            const xhr = new XMLHttpRequest();

            xhr.open(method, url);

            //xhr.responseType = 'json'; //если раскомментировать получим объект иначе просто строка
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
                if (xhr.status >= 400) {
                    reject(xhr.response);
                } else {
                    resolve(xhr.response);
                }
                reject(xhr.response);
            };

            xhr.send();
        });
    }

//наблюдаем за кнопкой
    const btnClickCount = document.querySelectorAll('.btn-click');

    btnClickCount.forEach(item =>{
        item.addEventListener('click', function (e) {
            //удаляем активный класс, число, все таблицы с классом main1
            removeClass();


                     let btnClick = e.currentTarget.getAttribute('class');


/////////////////////////////
                    if (btnClick === 'btn1 btn-click') {
                        e.currentTarget.classList.add('is-active-tab');
                        let btn1 = document.querySelector('.btn1__link-number');

                        sendRequest('GET', matchURL)
                            .then(function (matchAll) {
                                let matchAlll = JSON.parse(matchAll, function (key, value) {
                                    if (key === 'time') return new Date(value);
                                    return value;
                                });
                                //считаем матчи сегодня и завтра и показываем количество на кнопках
                                let getData = 0;
                                let allMatch = 0;
                                let btn1 = document.querySelector('.btn1__link-number');
                                let btn2 = document.querySelector('.btn2__link-number');
                                let btn3 = document.querySelector('.btn3__link-number');
                                let countMatchTodayN = 0;
                                let countMatchTomorrowN = 0;
                                let countMatchToday = [];
                                let  countMatchTomorrow = [];
                                let  getDataTime = 0;

                                for (let i = 0; i < matchAlll.length; i++) {

                                    getData = matchAlll[i].time.getDate();

                                    if( getData === 20){
                                        countMatchToday.push(matchAlll[i]);
                                        countMatchTodayN += 1;
                                        //console.log( countMatchToday);
                                    }
                                    if( getData === 21){
                                        countMatchTomorrowN += 1;
                                        //console.log(countMatchTomorrow);
                                    }
                                }
                                //console.log( countMatchToday);

                                allMatch = countMatchTodayN + countMatchTomorrowN;

                                btn3.innerHTML = allMatch;
                                btn2.innerHTML = countMatchTomorrowN;
                                btn1.innerHTML = countMatchTodayN;


                                //Англия
                                let liguaEngland = [];
                                let matchEnglandId10 = [];
                                let matchEnglandId11 = [];
                                let matchEnglandId12 = [];
                                let matchEnglandId13 = [];
                                let  liguaEnglandId10 = '';
                                let  liguaEnglandId11 = '';
                                let  liguaEnglandId12 = '';
                                let  liguaEnglandId13 = '';
                                let matchEnglandId = '';
                                let liguaEnglandId = '';
                                let liguaEnglandId2 = '';
                                let  liguaIdNumber = '';



                                //Европа
                                let  liguaEvropa = [];
                                let matchEvropaId15 = [];
                                let matchEvropaId14 = [];
                                let  liguaEvropaId15 = '';
                                let  liguaEvropaId14 = '';
                                let liguaEvropaId = '';
                                let matchEvropaId = '';
                                let liguaEvropaId2 = '';

//перебираем матчи которые пройдут сегодня
                                for (let i = 0; i <  countMatchToday.length; i++) {

                                    liguaIdNumber = countMatchToday[i].league_id;
                                    //console.log(liguaIdNumber);

                                    if (liguaIdNumber === 11 || liguaIdNumber === 10 || liguaIdNumber === 12 || liguaIdNumber === 13) {
                                        liguaEngland.push(countMatchToday[i]);
                                        //console.log(liguaEngland);
                                    }
                                    if(   liguaIdNumber === 14 || liguaIdNumber ===15){
                                        liguaEvropa.push(countMatchToday[i]);
                                        //console.log(liguaEvropa);
                                    }

                                }

                                        //проверка на пустоту, если не пустой, то отображаются данные на странице
                                        if(isEmpty(liguaEngland) === false) {
                                            //console.log(liguaEngland);

                                            //получаем по id название лиги и матч

                                            for (let i = 0; i < liguaEngland.length; i++) {
                                                matchEnglandId = liguaEngland[i].league_id;
                                                //получаем по id матч
                                                if (matchEnglandId === 10) {
                                                    matchEnglandId10.push(liguaEngland[i]);

                                                }
                                                if (matchEnglandId === 11) {
                                                    matchEnglandId11.push(liguaEngland[i]);
                                                    //console.log(matchEnglandId11)

                                                }
                                                if (matchEnglandId === 12) {
                                                    matchEnglandId12.push(liguaEngland[i]);
                                                    // console.log(matchEnglandId12)

                                                }
                                                if (matchEnglandId === 13) {
                                                    matchEnglandId13.push(liguaEngland[i]);

                                                }
                                            }
                                        }
                                        /////////////
                                //проверка на пустоту, если не пустой, то отображаются данные на странице
                                if(isEmpty( liguaEvropa) === false){
                                    //получаем по id название лиги и матч

                                    for (let i = 0; i < liguaEvropa.length; i++) {
                                        matchEvropaId = liguaEvropa[i].league_id;
                                        //получаем по id матч
                                        if ( matchEvropaId === 15) {
                                            matchEvropaId15.push(liguaEvropa[i]);

                                        }

                                    }
                                    //console.log(matchEvropaId15);
                                }


                                //получаем по id название лиги

                                            sendRequest('GET', leagueURL)
                                                .then(function (leagueAll) {
                                                    let leagueAlll = JSON.parse(leagueAll);

                                                    for(let i = 0; i < leagueAlll.length; i++){
                                                        //console.log(leagueAlll)
                                                        liguaEnglandId =  leagueAlll[i].items;
                                                        for(let i = 0; i <  liguaEnglandId.length; i++){
                                                            liguaEnglandId2 =  liguaEnglandId[i].id;
                                                            if(liguaEnglandId2 === 10){
                                                                 liguaEnglandId10 = liguaEnglandId[i].item;

                                                            }
                                                            if(liguaEnglandId2 === 11){
                                                                liguaEnglandId11 = liguaEnglandId[i].item;

                                                            }
                                                            if(liguaEnglandId2 === 12){
                                                                liguaEnglandId12 = liguaEnglandId[i].item;

                                                            }
                                                            if(liguaEnglandId2 === 13){
                                                                liguaEnglandId13 = liguaEnglandId[i].item;

                                                            }
                                                        }

                                                        //
                                                    }

                                                    //////////////////////////////////
                                                    for(let i = 0; i < leagueAlll.length; i++){
                                                        //console.log(leagueAlll)
                                                        liguaEvropaId =  leagueAlll[i].items;
                                                        for(let i = 0; i <  liguaEvropaId.length; i++){
                                                            liguaEvropaId2 =  liguaEvropaId[i].id;
                                                            // console.log( liguaEvropaId2)
                                                            if(liguaEvropaId2 === 15){
                                                                liguaEvropaId15 = liguaEvropaId[i].item;
                                                            }
                                                            if(liguaEvropaId2 === 15){
                                                                liguaEvropaId14 = liguaEvropaId[i].item;
                                                            }

                                                        }
                                                        //console.log(liguaEvropaId15);

                                                        //
                                                    }
                                                    //console.log(liguaEvropaId13);


                                                    //Если массивы не пусты отображаем данные на странице
                                                    if((isEmpty( matchEvropaId15) === false) && (isEmpty( liguaEvropaId15) === false)){
                                                            let table = document.createElement('table');
                                                            let tr = document.createElement('tr');
                                                            let tr2 = document.createElement('tr');
                                                            let th1 = document.createElement('th');
                                                            let img = document.createElement('img');
                                                            let th2 = document.createElement('th');
                                                            let td1 = document.createElement('td');
                                                            let td2 = document.createElement('td');
                                                            let td3 = document.createElement('td');
                                                            let td4 = document.createElement('td');
                                                            let td4span = document.createElement('span');
                                                            let td5 = document.createElement('td');
                                                            let td2a = document.createElement('a');
                                                            let td5a = document.createElement('a');
                                                            let th2Text = document.createTextNode(`Европа: ${liguaEvropaId15}`);
                                                            let td1Text = document.createTextNode(`${matchEvropaId15[0].time.getHours()}:${matchEvropaId15[0].time.getMinutes()}`);
                                                            let td2Text = document.createTextNode(`${matchEvropaId15[0].name}`);
                                                            let td4Text = document.createTextNode(`${matchEvropaId15[0].status}`);
                                                            let td5Text = document.createTextNode('Подробнее');

                                                            td3.className = 'svg-yellow';
                                                            table.className = 'main1';
                                                            img.src = 'assets/img/svg/flagEurope.svg';
                                                            td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                                            th2.colSpan = "4";
                                                            td4.append(td4span);
                                                            td4span.append(td4Text);
                                                            td2a.href = `${matchEvropaId15[0].link}`;
                                                            td2a.append(td2Text);
                                                            td5a.append(td5Text);
                                                            td5a.href = `${matchEvropaId15[0].link}`;
                                                            td2.append(td2a);
                                                            td5.append(td5a);
                                                            th2.append( th2Text);
                                                            td1.append(td1Text);
                                                            th1.append(img);
                                                            tr2.append(td1, td2, td3, td4, td5);
                                                            tr.append(th1, th2);
                                                            table.append(tr, tr2);
                                                            let main = document.querySelector('.content__main');
                                                            main.prepend(table);
                                                    }

                                                    //Если массивы не пусты отображаем данные на странице
                                                    if((isEmpty( matchEnglandId12) === false) && (isEmpty( liguaEnglandId12) === false)){
                                                        for(let i = 0; i < matchEnglandId12.length; i++) {

                                                            let table = document.createElement('table');
                                                            let tr = document.createElement('tr');
                                                            let tr2 = document.createElement('tr');
                                                            let th1 = document.createElement('th');
                                                            let img = document.createElement('img');
                                                            let th2 = document.createElement('th');
                                                            let td1 = document.createElement('td');
                                                            let td2 = document.createElement('td');
                                                            let td3 = document.createElement('td');
                                                            let td4 = document.createElement('td');
                                                            let td4span = document.createElement('span');
                                                            let td5 = document.createElement('td');
                                                            let td2a = document.createElement('a');
                                                            let td5a = document.createElement('a');
                                                            let th2Text = document.createTextNode(`Англия: ${liguaEnglandId12}`);
                                                            let td1Text = document.createTextNode(`${matchEnglandId12[i].time.getHours()}:${matchEnglandId12[i].time.getMinutes()}`);
                                                            let td2Text = document.createTextNode(`${matchEnglandId12[i].name}`);
                                                            let td4Text = document.createTextNode(`${matchEnglandId12[i].status}`);
                                                            let td5Text = document.createTextNode('Подробнее');

                                                            td3.className = 'svg-opacity';
                                                            table.className = 'main1';
                                                            img.src = 'assets/img/svg/england.svg';
                                                            td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                                            th2.colSpan = "4";
                                                            td4.append(td4span);
                                                            td4span.append(td4Text);
                                                            td2a.href = `${matchEnglandId12[i].link}`;
                                                            td2a.append(td2Text);
                                                            td5a.append(td5Text);
                                                            td5a.href = `${matchEnglandId12[i].link}`;
                                                            td2.append(td2a);
                                                            td5.append(td5a);
                                                            th2.append(th2Text);
                                                            td1.append(td1Text);
                                                            th1.append(img);
                                                            tr2.append(td1, td2, td3, td4, td5);
                                                            tr.append(th1, th2);
                                                            table.append(tr, tr2);
                                                            let main = document.querySelector('.content__main');
                                                            main.prepend(table);
                                                        }

                                                    }
                                                })
                                                 .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));
                            })
                            .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));
                    }

//////////////////////-----------Вторая кнопка-------------/////////////////////////
            if (btnClick === 'btn2 btn-click') {
                e.currentTarget.classList.add('is-active-tab');

                let btn1 = document.querySelector('.btn1__link-number');

                sendRequest('GET', matchURL)
                    .then(function (matchAll) {
                        let matchAlll = JSON.parse(matchAll, function (key, value) {
                            if (key === 'time') return new Date(value);
                            return value;
                        });
                        //считаем матчи сегодня и завтра и показываем количество на кнопках
                        let getData = 0;
                        let allMatch = 0;
                        let btn1 = document.querySelector('.btn1__link-number');
                        let btn2 = document.querySelector('.btn2__link-number');
                        let btn3 = document.querySelector('.btn3__link-number');
                        let countMatchTodayN = 0;
                        let countMatchTomorrowN = 0;
                        let countMatchToday = [];
                        let  countMatchTomorrow = [];
                        let  getDataTime = 0;

                        for (let i = 0; i < matchAlll.length; i++) {

                            getData = matchAlll[i].time.getDate();

                            if( getData === 20){
                                // countMatchToday.push(matchAlll[i]);
                                countMatchTodayN += 1;
                                //console.log( countMatchToday);
                            }
                            if( getData === 21){
                                countMatchTomorrowN += 1;
                                countMatchToday.push(matchAlll[i]);
                                //console.log(countMatchTomorrow);
                            }
                        }
                        //console.log( countMatchToday);

                        allMatch = countMatchTodayN + countMatchTomorrowN;

                        btn3.innerHTML = allMatch;
                        btn2.innerHTML = countMatchTomorrowN;
                        btn1.innerHTML = countMatchTodayN;


                        //Англия
                        let liguaEngland = [];
                        let matchEnglandId10 = [];
                        let matchEnglandId11 = [];
                        let matchEnglandId12 = [];
                        let matchEnglandId13 = [];
                        let  liguaEnglandId10 = '';
                        let  liguaEnglandId11 = '';
                        let  liguaEnglandId12 = '';
                        let  liguaEnglandId13 = '';
                        let matchEnglandId = '';
                        let liguaEnglandId = '';
                        let liguaEnglandId2 = '';
                        let  liguaIdNumber = '';



                        //Европа
                        let  liguaEvropa = [];
                        let matchEvropaId15 = [];
                        let matchEvropaId14 = [];
                        let  liguaEvropaId15 = '';
                        let  liguaEvropaId14 = '';
                        let liguaEvropaId = '';
                        let matchEvropaId = '';
                        let liguaEvropaId2 = '';

//перебираем матчи которые пройдут сегодня
                        for (let i = 0; i <  countMatchToday.length; i++) {

                            liguaIdNumber = countMatchToday[i].league_id;
                            //console.log(liguaIdNumber);

                            if (liguaIdNumber === 11 || liguaIdNumber === 10 || liguaIdNumber === 12 || liguaIdNumber === 13) {
                                liguaEngland.push(countMatchToday[i]);
                                //console.log(liguaEngland);
                            }
                            if(   liguaIdNumber === 14 || liguaIdNumber ===15){
                                liguaEvropa.push(countMatchToday[i]);
                                // console.log(liguaEvropa);
                            }

                        }
                        //console.log(liguaEvropa);

                        //проверка на пустоту, если не пустой, то отображаются данные на странице
                        if(isEmpty(liguaEngland) === false) {
                            //console.log(liguaEngland);

                            //получаем по id название лиги и матч

                            for (let i = 0; i < liguaEngland.length; i++) {
                                matchEnglandId = liguaEngland[i].league_id;
                                //console.log(matchEnglandId)

                                //получаем по id матч
                                if (matchEnglandId === 10) {
                                    matchEnglandId10.push(liguaEngland[i]);
                                    //console.log(matchEnglandId10)
                                }
                                if (matchEnglandId === 11) {
                                    matchEnglandId11.push(liguaEngland[i]);
                                    //console.log(matchEnglandId11)

                                }
                                if (matchEnglandId === 12) {
                                    matchEnglandId12.push(liguaEngland[i]);
                                    // console.log(matchEnglandId12)

                                }
                                if (matchEnglandId === 13) {
                                    matchEnglandId13.push(liguaEngland[i]);

                                }
                            }
                        }
                        /////////////
                        //проверка на пустоту, если не пустой, то отображаются данные на странице
                        if(isEmpty( liguaEvropa) === false){
                            //получаем по id название лиги и матч

                            for (let i = 0; i < liguaEvropa.length; i++) {
                                matchEvropaId = liguaEvropa[i].league_id;
                                //получаем по id матч
                                if ( matchEvropaId === 15) {
                                    matchEvropaId15.push(liguaEvropa[i]);

                                }
                                if ( matchEvropaId === 14) {
                                    matchEvropaId14.push(liguaEvropa[i]);
                                    //console.log(matchEvropaId14)

                                }

                            }
                            // console.log(matchEvropaId15);
                            // console.log(matchEvropaId14);
                        }


                        //получаем по id название лиги

                        sendRequest('GET', leagueURL)
                            .then(function (leagueAll) {
                                let leagueAlll = JSON.parse(leagueAll);

                                for(let i = 0; i < leagueAlll.length; i++){
                                    //console.log(leagueAlll)
                                    liguaEnglandId =  leagueAlll[i].items;
                                    for(let i = 0; i <  liguaEnglandId.length; i++){
                                        liguaEnglandId2 =  liguaEnglandId[i].id;
                                        if(liguaEnglandId2 === 10){
                                            liguaEnglandId10 = liguaEnglandId[i].item;

                                        }
                                        if(liguaEnglandId2 === 11){
                                            liguaEnglandId11 = liguaEnglandId[i].item;

                                        }
                                        if(liguaEnglandId2 === 12){
                                            liguaEnglandId12 = liguaEnglandId[i].item;

                                        }
                                        if(liguaEnglandId2 === 13){
                                            liguaEnglandId13 = liguaEnglandId[i].item;

                                        }
                                    }

                                    //
                                }

                                //////////////////////////////////
                                for(let i = 0; i < leagueAlll.length; i++){
                                    //console.log(leagueAlll)
                                    liguaEvropaId =  leagueAlll[i].items;
                                    for(let i = 0; i <  liguaEvropaId.length; i++){
                                        liguaEvropaId2 =  liguaEvropaId[i].id;
                                        // console.log( liguaEvropaId2)
                                        if(liguaEvropaId2 === 15){
                                            liguaEvropaId15 = liguaEvropaId[i].item;
                                        }
                                        if(liguaEvropaId2 === 14){
                                            liguaEvropaId14 = liguaEvropaId[i].item;

                                        }

                                    }
                                    //console.log(liguaEvropaId15);

                                    //
                                }
                                //console.log(liguaEvropaId13);

                                //Если массивы не пусты отображаем данные на странице
                                if((isEmpty( matchEnglandId10) === false) && (isEmpty( liguaEnglandId10) === false)){

                                        let table = document.createElement('table');
                                        let tr = document.createElement('tr');
                                        let tr2 = document.createElement('tr');
                                        let th1 = document.createElement('th');
                                        let img = document.createElement('img');
                                        let th2 = document.createElement('th');
                                        let td1 = document.createElement('td');
                                        let td2 = document.createElement('td');
                                        let td3 = document.createElement('td');
                                        let td4 = document.createElement('td');
                                        let td4span = document.createElement('span');
                                        let td5 = document.createElement('td');
                                        let td2a = document.createElement('a');
                                        let td5a = document.createElement('a');
                                        let th2Text = document.createTextNode(`Англия: ${liguaEnglandId10}`);
                                        let td1Text = document.createTextNode(`${matchEnglandId10[0].time.getHours()}:${matchEnglandId10[0].time.getMinutes()}`);
                                        let td2Text = document.createTextNode(`${matchEnglandId10[0].name}`);
                                        let td4Text = document.createTextNode(`${matchEnglandId10[0].status}`);
                                        let td5Text = document.createTextNode('Подробнее');

                                        td3.className = 'svg-opacity';
                                        table.className = 'main1';
                                        img.src = 'assets/img/svg/england.svg';
                                        td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                        th2.colSpan = "4";
                                        td4.append(td4span);
                                        td4span.append(td4Text);
                                        td2a.href = `${matchEnglandId10[0].link}`;
                                        td2a.append(td2Text);
                                        td5a.append(td5Text);
                                        td5a.href = `${matchEnglandId10[0].link}`;
                                        td2.append(td2a);
                                        td5.append(td5a);
                                        th2.append(th2Text);
                                        td1.append(td1Text);
                                        th1.append(img);
                                        tr2.append(td1, td2, td3, td4, td5);
                                        tr.append(th1, th2);
                                        table.append(tr, tr2);
                                        let main = document.querySelector('.content__main');
                                        main.prepend(table);


                                }


                                //Если массивы не пусты отображаем данные на странице
                                if((isEmpty( matchEvropaId15) === false) && (isEmpty( liguaEvropaId15) === false)){
                                    for(let i = 0; i < matchEvropaId15.length; i++) {

                                        let table = document.createElement('table');
                                        let tr = document.createElement('tr');
                                        let tr2 = document.createElement('tr');
                                        let th1 = document.createElement('th');
                                        let img = document.createElement('img');
                                        let th2 = document.createElement('th');
                                        let td1 = document.createElement('td');
                                        let td2 = document.createElement('td');
                                        let td3 = document.createElement('td');
                                        let td4 = document.createElement('td');
                                        let td4span = document.createElement('span');
                                        let td5 = document.createElement('td');
                                        let td2a = document.createElement('a');
                                        let td5a = document.createElement('a');
                                        let th2Text = document.createTextNode(`Европа: ${liguaEvropaId15}`);
                                        let td1Text = document.createTextNode(`${matchEvropaId15[i].time.getHours()}:${matchEvropaId15[i].time.getMinutes()}`);
                                        let td2Text = document.createTextNode(`${matchEvropaId15[i].name}`);
                                        let td4Text = document.createTextNode(`${matchEvropaId15[i].status}`);
                                        let td5Text = document.createTextNode('Подробнее');

                                        td3.className = 'svg-yellow';
                                        table.className = 'main1';
                                        img.src = 'assets/img/svg/flagEurope.svg';
                                        td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                        th2.colSpan = "4";
                                        td4.append(td4span);
                                        td4span.append(td4Text);
                                        td2a.href = `${matchEvropaId15[i].link}`;
                                        td2a.append(td2Text);
                                        td5a.append(td5Text);
                                        td5a.href = `${matchEvropaId15[i].link}`;
                                        td2.append(td2a);
                                        td5.append(td5a);
                                        th2.append(th2Text);
                                        td1.append(td1Text);
                                        th1.append(img);
                                        tr2.append(td1, td2, td3, td4, td5);
                                        tr.append(th1, th2);
                                        table.append(tr, tr2);
                                        let main = document.querySelector('.content__main');
                                        main.prepend(table);

                                    }
                                }
                                 // console.log(matchEvropaId15);
                                 // console.log(liguaEvropaId15);

                                //Если массивы не пусты отображаем данные на странице
                                if((isEmpty( matchEvropaId14) === false) && (isEmpty( liguaEvropaId14) === false)){
                                    for(let i = 0; i < matchEvropaId14.length; i++) {

                                        let table = document.createElement('table');
                                        let tr = document.createElement('tr');
                                        let tr2 = document.createElement('tr');
                                        let th1 = document.createElement('th');
                                        let img = document.createElement('img');
                                        let th2 = document.createElement('th');
                                        let td1 = document.createElement('td');
                                        let td2 = document.createElement('td');
                                        let td3 = document.createElement('td');
                                        let td4 = document.createElement('td');
                                        let td4span = document.createElement('span');
                                        let td5 = document.createElement('td');
                                        let td2a = document.createElement('a');
                                        let td5a = document.createElement('a');
                                        let th2Text = document.createTextNode(`Европа: ${liguaEvropaId14}`);
                                        let td1Text = document.createTextNode(`${matchEvropaId14[i].time.getHours()}:${matchEvropaId14[i].time.getMinutes()}`);
                                        let td2Text = document.createTextNode(`${matchEvropaId14[i].name}`);
                                        let td4Text = document.createTextNode(`${matchEvropaId14[i].status}`);
                                        let td5Text = document.createTextNode('Подробнее');

                                        td3.className = 'svg-opacity';
                                        table.className = 'main1';
                                        img.src = 'assets/img/svg/flagEurope.svg';
                                        td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                        th2.colSpan = "4";
                                        td4.append(td4span);
                                        td4span.append(td4Text);
                                        td2a.href = `${matchEvropaId14[i].link}`;
                                        td2a.append(td2Text);
                                        td5a.append(td5Text);
                                        td5a.href = `${matchEvropaId14[i].link}`;
                                        td2.append(td2a);
                                        td5.append(td5a);
                                        th2.append(th2Text);
                                        td1.append(td1Text);
                                        th1.append(img);
                                        tr2.append(td1, td2, td3, td4, td5);
                                        tr.append(th1, th2);
                                        table.append(tr, tr2);
                                        let main = document.querySelector('.content__main');
                                        main.prepend(table);

                                    }
                                }


                            })
                             .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));(err => console.log(err));
                    })
                    .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));
            }


            if (btnClick === 'btn3 btn-click') {
                        e.currentTarget.classList.add('is-active-tab');
                let btn1Result = function () {

                    let btn1 = document.querySelector('.btn1__link-number');

                    sendRequest('GET', matchURL)
                        .then(function (matchAll) {
                            let matchAlll = JSON.parse(matchAll, function (key, value) {
                                if (key === 'time') return new Date(value);
                                return value;
                            });
                            //считаем матчи сегодня и завтра и показываем количество на кнопках
                            let getData = 0;
                            let allMatch = 0;
                            let btn1 = document.querySelector('.btn1__link-number');
                            let btn2 = document.querySelector('.btn2__link-number');
                            let btn3 = document.querySelector('.btn3__link-number');
                            let countMatchTodayN = 0;
                            let countMatchTomorrowN = 0;
                            let countMatchToday = [];
                            let  countMatchTomorrow = [];
                            let  getDataTime = 0;

                            for (let i = 0; i < matchAlll.length; i++) {

                                getData = matchAlll[i].time.getDate();

                                if( getData === 20){
                                    countMatchToday.push(matchAlll[i]);
                                    countMatchTodayN += 1;
                                    //console.log( countMatchToday);
                                }
                                if( getData === 21){
                                    countMatchTomorrowN += 1;
                                    //console.log(countMatchTomorrow);
                                }
                            }
                            //console.log( countMatchToday);

                            allMatch = countMatchTodayN + countMatchTomorrowN;

                            btn3.innerHTML = allMatch;
                            btn2.innerHTML = countMatchTomorrowN;
                            btn1.innerHTML = countMatchTodayN;


                            //Англия
                            let liguaEngland = [];
                            let matchEnglandId10 = [];
                            let matchEnglandId11 = [];
                            let matchEnglandId12 = [];
                            let matchEnglandId13 = [];
                            let  liguaEnglandId10 = '';
                            let  liguaEnglandId11 = '';
                            let  liguaEnglandId12 = '';
                            let  liguaEnglandId13 = '';
                            let matchEnglandId = '';
                            let liguaEnglandId = '';
                            let liguaEnglandId2 = '';
                            let  liguaIdNumber = '';



                            //Европа
                            let  liguaEvropa = [];
                            let matchEvropaId15 = [];
                            let matchEvropaId14 = [];
                            let  liguaEvropaId15 = '';
                            let  liguaEvropaId14 = '';
                            let liguaEvropaId = '';
                            let matchEvropaId = '';
                            let liguaEvropaId2 = '';

//перебираем матчи которые пройдут сегодня
                            for (let i = 0; i <  countMatchToday.length; i++) {

                                liguaIdNumber = countMatchToday[i].league_id;
                                //console.log(liguaIdNumber);

                                if (liguaIdNumber === 11 || liguaIdNumber === 10 || liguaIdNumber === 12 || liguaIdNumber === 13) {
                                    liguaEngland.push(countMatchToday[i]);
                                    //console.log(liguaEngland);
                                }
                                if(   liguaIdNumber === 14 || liguaIdNumber ===15){
                                    liguaEvropa.push(countMatchToday[i]);
                                    //console.log(liguaEvropa);
                                }

                            }

                            //проверка на пустоту, если не пустой, то отображаются данные на странице
                            if(isEmpty(liguaEngland) === false) {
                                //console.log(liguaEngland);

                                //получаем по id название лиги и матч

                                for (let i = 0; i < liguaEngland.length; i++) {
                                    matchEnglandId = liguaEngland[i].league_id;
                                    //получаем по id матч
                                    if (matchEnglandId === 10) {
                                        matchEnglandId10.push(liguaEngland[i]);

                                    }
                                    if (matchEnglandId === 11) {
                                        matchEnglandId11.push(liguaEngland[i]);
                                        //console.log(matchEnglandId11)

                                    }
                                    if (matchEnglandId === 12) {
                                        matchEnglandId12.push(liguaEngland[i]);
                                        // console.log(matchEnglandId12)

                                    }
                                    if (matchEnglandId === 13) {
                                        matchEnglandId13.push(liguaEngland[i]);

                                    }
                                }
                            }
                            /////////////
                            //проверка на пустоту, если не пустой, то отображаются данные на странице
                            if(isEmpty( liguaEvropa) === false){
                                //получаем по id название лиги и матч

                                for (let i = 0; i < liguaEvropa.length; i++) {
                                    matchEvropaId = liguaEvropa[i].league_id;
                                    //получаем по id матч
                                    if ( matchEvropaId === 15) {
                                        matchEvropaId15.push(liguaEvropa[i]);

                                    }

                                }
                                //console.log(matchEvropaId15);
                            }


                            //получаем по id название лиги

                            sendRequest('GET', leagueURL)
                                .then(function (leagueAll) {
                                    let leagueAlll = JSON.parse(leagueAll);

                                    for(let i = 0; i < leagueAlll.length; i++){
                                        //console.log(leagueAlll)
                                        liguaEnglandId =  leagueAlll[i].items;
                                        for(let i = 0; i <  liguaEnglandId.length; i++){
                                            liguaEnglandId2 =  liguaEnglandId[i].id;
                                            if(liguaEnglandId2 === 10){
                                                liguaEnglandId10 = liguaEnglandId[i].item;

                                            }
                                            if(liguaEnglandId2 === 11){
                                                liguaEnglandId11 = liguaEnglandId[i].item;

                                            }
                                            if(liguaEnglandId2 === 12){
                                                liguaEnglandId12 = liguaEnglandId[i].item;

                                            }
                                            if(liguaEnglandId2 === 13){
                                                liguaEnglandId13 = liguaEnglandId[i].item;

                                            }
                                        }

                                        //
                                    }

                                    //////////////////////////////////
                                    for(let i = 0; i < leagueAlll.length; i++){
                                        //console.log(leagueAlll)
                                        liguaEvropaId =  leagueAlll[i].items;
                                        for(let i = 0; i <  liguaEvropaId.length; i++){
                                            liguaEvropaId2 =  liguaEvropaId[i].id;
                                            // console.log( liguaEvropaId2)
                                            if(liguaEvropaId2 === 15){
                                                liguaEvropaId15 = liguaEvropaId[i].item;
                                            }
                                            if(liguaEvropaId2 === 15){
                                                liguaEvropaId14 = liguaEvropaId[i].item;
                                            }

                                        }
                                        //console.log(liguaEvropaId15);

                                        //
                                    }
                                    //console.log(liguaEvropaId13);


                                    //Если массивы не пусты отображаем данные на странице
                                    if((isEmpty( matchEvropaId15) === false) && (isEmpty( liguaEvropaId15) === false)){
                                        let table = document.createElement('table');
                                        let tr = document.createElement('tr');
                                        let tr2 = document.createElement('tr');
                                        let th1 = document.createElement('th');
                                        let img = document.createElement('img');
                                        let th2 = document.createElement('th');
                                        let td1 = document.createElement('td');
                                        let td2 = document.createElement('td');
                                        let td3 = document.createElement('td');
                                        let td4 = document.createElement('td');
                                        let td4span = document.createElement('span');
                                        let td5 = document.createElement('td');
                                        let td2a = document.createElement('a');
                                        let td5a = document.createElement('a');
                                        let th2Text = document.createTextNode(`Европа: ${liguaEvropaId15}`);
                                        let td1Text = document.createTextNode(`${matchEvropaId15[0].time.getHours()}:${matchEvropaId15[0].time.getMinutes()}`);
                                        let td2Text = document.createTextNode(`${matchEvropaId15[0].name}`);
                                        let td4Text = document.createTextNode(`${matchEvropaId15[0].status}`);
                                        let td5Text = document.createTextNode('Подробнее');

                                        td3.className = 'svg-yellow';
                                        table.className = 'main1';
                                        img.src = 'assets/img/svg/flagEurope.svg';
                                        td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                        th2.colSpan = "4";
                                        td4.append(td4span);
                                        td4span.append(td4Text);
                                        td2a.href = `${matchEvropaId15[0].link}`;
                                        td2a.append(td2Text);
                                        td5a.append(td5Text);
                                        td5a.href = `${matchEvropaId15[0].link}`;
                                        td2.append(td2a);
                                        td5.append(td5a);
                                        th2.append( th2Text);
                                        td1.append(td1Text);
                                        th1.append(img);
                                        tr2.append(td1, td2, td3, td4, td5);
                                        tr.append(th1, th2);
                                        table.append(tr, tr2);
                                        let main = document.querySelector('.content__main');
                                        main.prepend(table);
                                    }

                                    //Если массивы не пусты отображаем данные на странице
                                    if((isEmpty( matchEnglandId12) === false) && (isEmpty( liguaEnglandId12) === false)){
                                        for(let i = 0; i < matchEnglandId12.length; i++) {

                                            let table = document.createElement('table');
                                            let tr = document.createElement('tr');
                                            let tr2 = document.createElement('tr');
                                            let th1 = document.createElement('th');
                                            let img = document.createElement('img');
                                            let th2 = document.createElement('th');
                                            let td1 = document.createElement('td');
                                            let td2 = document.createElement('td');
                                            let td3 = document.createElement('td');
                                            let td4 = document.createElement('td');
                                            let td4span = document.createElement('span');
                                            let td5 = document.createElement('td');
                                            let td2a = document.createElement('a');
                                            let td5a = document.createElement('a');
                                            let th2Text = document.createTextNode(`Англия: ${liguaEnglandId12}`);
                                            let td1Text = document.createTextNode(`${matchEnglandId12[i].time.getHours()}:${matchEnglandId12[i].time.getMinutes()}`);
                                            let td2Text = document.createTextNode(`${matchEnglandId12[i].name}`);
                                            let td4Text = document.createTextNode(`${matchEnglandId12[i].status}`);
                                            let td5Text = document.createTextNode('Подробнее');

                                            td3.className = 'svg-opacity';
                                            table.className = 'main1';
                                            img.src = 'assets/img/svg/england.svg';
                                            td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                            th2.colSpan = "4";
                                            td4.append(td4span);
                                            td4span.append(td4Text);
                                            td2a.href = `${matchEnglandId12[i].link}`;
                                            td2a.append(td2Text);
                                            td5a.append(td5Text);
                                            td5a.href = `${matchEnglandId12[i].link}`;
                                            td2.append(td2a);
                                            td5.append(td5a);
                                            th2.append(th2Text);
                                            td1.append(td1Text);
                                            th1.append(img);
                                            tr2.append(td1, td2, td3, td4, td5);
                                            tr.append(th1, th2);
                                            table.append(tr, tr2);
                                            let main = document.querySelector('.content__main');
                                            main.prepend(table);
                                        }

                                    }
                                })
                                 .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));(err => console.log(err));

                        })
                        .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));

                }
                btn1Result();

                //
                let btn2Result = function () {

                    let btn1 = document.querySelector('.btn1__link-number');

                    sendRequest('GET', matchURL)
                        .then(function (matchAll) {
                            let matchAlll = JSON.parse(matchAll, function (key, value) {
                                if (key === 'time') return new Date(value);
                                return value;
                            });
                            //считаем матчи сегодня и завтра и показываем количество на кнопках
                            let getData = 0;
                            let allMatch = 0;
                            let btn1 = document.querySelector('.btn1__link-number');
                            let btn2 = document.querySelector('.btn2__link-number');
                            let btn3 = document.querySelector('.btn3__link-number');
                            let countMatchTodayN = 0;
                            let countMatchTomorrowN = 0;
                            let countMatchToday = [];
                            let  countMatchTomorrow = [];
                            let  getDataTime = 0;

                            for (let i = 0; i < matchAlll.length; i++) {

                                getData = matchAlll[i].time.getDate();

                                if( getData === 20){
                                    // countMatchToday.push(matchAlll[i]);
                                    countMatchTodayN += 1;
                                    //console.log( countMatchToday);
                                }
                                if( getData === 21){
                                    countMatchTomorrowN += 1;
                                    countMatchToday.push(matchAlll[i]);
                                    //console.log(countMatchTomorrow);
                                }
                            }
                            //console.log( countMatchToday);

                            allMatch = countMatchTodayN + countMatchTomorrowN;

                            btn3.innerHTML = allMatch;
                            btn2.innerHTML = countMatchTomorrowN;
                            btn1.innerHTML = countMatchTodayN;


                            //Англия
                            let liguaEngland = [];
                            let matchEnglandId10 = [];
                            let matchEnglandId11 = [];
                            let matchEnglandId12 = [];
                            let matchEnglandId13 = [];
                            let  liguaEnglandId10 = '';
                            let  liguaEnglandId11 = '';
                            let  liguaEnglandId12 = '';
                            let  liguaEnglandId13 = '';
                            let matchEnglandId = '';
                            let liguaEnglandId = '';
                            let liguaEnglandId2 = '';
                            let  liguaIdNumber = '';



                            //Европа
                            let  liguaEvropa = [];
                            let matchEvropaId15 = [];
                            let matchEvropaId14 = [];
                            let  liguaEvropaId15 = '';
                            let  liguaEvropaId14 = '';
                            let liguaEvropaId = '';
                            let matchEvropaId = '';
                            let liguaEvropaId2 = '';

//перебираем матчи которые пройдут сегодня
                            for (let i = 0; i <  countMatchToday.length; i++) {

                                liguaIdNumber = countMatchToday[i].league_id;
                                //console.log(liguaIdNumber);

                                if (liguaIdNumber === 11 || liguaIdNumber === 10 || liguaIdNumber === 12 || liguaIdNumber === 13) {
                                    liguaEngland.push(countMatchToday[i]);
                                    //console.log(liguaEngland);
                                }
                                if(   liguaIdNumber === 14 || liguaIdNumber ===15){
                                    liguaEvropa.push(countMatchToday[i]);
                                    // console.log(liguaEvropa);
                                }

                            }
                            //console.log(liguaEvropa);

                            //проверка на пустоту, если не пустой, то отображаются данные на странице
                            if(isEmpty(liguaEngland) === false) {
                                //console.log(liguaEngland);

                                //получаем по id название лиги и матч

                                for (let i = 0; i < liguaEngland.length; i++) {
                                    matchEnglandId = liguaEngland[i].league_id;
                                    //console.log(matchEnglandId)

                                    //получаем по id матч
                                    if (matchEnglandId === 10) {
                                        matchEnglandId10.push(liguaEngland[i]);
                                        //console.log(matchEnglandId10)
                                    }
                                    if (matchEnglandId === 11) {
                                        matchEnglandId11.push(liguaEngland[i]);
                                        //console.log(matchEnglandId11)

                                    }
                                    if (matchEnglandId === 12) {
                                        matchEnglandId12.push(liguaEngland[i]);
                                        // console.log(matchEnglandId12)

                                    }
                                    if (matchEnglandId === 13) {
                                        matchEnglandId13.push(liguaEngland[i]);

                                    }
                                }
                            }
                            /////////////
                            //проверка на пустоту, если не пустой, то отображаются данные на странице
                            if(isEmpty( liguaEvropa) === false){
                                //получаем по id название лиги и матч

                                for (let i = 0; i < liguaEvropa.length; i++) {
                                    matchEvropaId = liguaEvropa[i].league_id;
                                    //получаем по id матч
                                    if ( matchEvropaId === 15) {
                                        matchEvropaId15.push(liguaEvropa[i]);

                                    }
                                    if ( matchEvropaId === 14) {
                                        matchEvropaId14.push(liguaEvropa[i]);
                                        //console.log(matchEvropaId14)

                                    }

                                }
                                // console.log(matchEvropaId15);
                                // console.log(matchEvropaId14);
                            }


                            //получаем по id название лиги

                            sendRequest('GET', leagueURL)
                                .then(function (leagueAll) {
                                    let leagueAlll = JSON.parse(leagueAll);

                                    for(let i = 0; i < leagueAlll.length; i++){
                                        //console.log(leagueAlll)
                                        liguaEnglandId =  leagueAlll[i].items;
                                        for(let i = 0; i <  liguaEnglandId.length; i++){
                                            liguaEnglandId2 =  liguaEnglandId[i].id;
                                            if(liguaEnglandId2 === 10){
                                                liguaEnglandId10 = liguaEnglandId[i].item;

                                            }
                                            if(liguaEnglandId2 === 11){
                                                liguaEnglandId11 = liguaEnglandId[i].item;

                                            }
                                            if(liguaEnglandId2 === 12){
                                                liguaEnglandId12 = liguaEnglandId[i].item;

                                            }
                                            if(liguaEnglandId2 === 13){
                                                liguaEnglandId13 = liguaEnglandId[i].item;

                                            }
                                        }

                                        //
                                    }

                                    //////////////////////////////////
                                    for(let i = 0; i < leagueAlll.length; i++){
                                        //console.log(leagueAlll)
                                        liguaEvropaId =  leagueAlll[i].items;
                                        for(let i = 0; i <  liguaEvropaId.length; i++){
                                            liguaEvropaId2 =  liguaEvropaId[i].id;
                                            // console.log( liguaEvropaId2)
                                            if(liguaEvropaId2 === 15){
                                                liguaEvropaId15 = liguaEvropaId[i].item;
                                            }
                                            if(liguaEvropaId2 === 14){
                                                liguaEvropaId14 = liguaEvropaId[i].item;

                                            }

                                        }
                                        //console.log(liguaEvropaId15);

                                        //
                                    }
                                    //console.log(liguaEvropaId13);

                                    //Если массивы не пусты отображаем данные на странице
                                    if((isEmpty( matchEnglandId10) === false) && (isEmpty( liguaEnglandId10) === false)){

                                        let table = document.createElement('table');
                                        let tr = document.createElement('tr');
                                        let tr2 = document.createElement('tr');
                                        let th1 = document.createElement('th');
                                        let img = document.createElement('img');
                                        let th2 = document.createElement('th');
                                        let td1 = document.createElement('td');
                                        let td2 = document.createElement('td');
                                        let td3 = document.createElement('td');
                                        let td4 = document.createElement('td');
                                        let td4span = document.createElement('span');
                                        let td5 = document.createElement('td');
                                        let td2a = document.createElement('a');
                                        let td5a = document.createElement('a');
                                        let th2Text = document.createTextNode(`Англия: ${liguaEnglandId10}`);
                                        let td1Text = document.createTextNode(`${matchEnglandId10[0].time.getHours()}:${matchEnglandId10[0].time.getMinutes()}`);
                                        let td2Text = document.createTextNode(`${matchEnglandId10[0].name}`);
                                        let td4Text = document.createTextNode(`${matchEnglandId10[0].status}`);
                                        let td5Text = document.createTextNode('Подробнее');

                                        td3.className = 'svg-opacity';
                                        table.className = 'main1';
                                        img.src = 'assets/img/svg/england.svg';
                                        td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                        th2.colSpan = "4";
                                        td4.append(td4span);
                                        td4span.append(td4Text);
                                        td2a.href = `${matchEnglandId10[0].link}`;
                                        td2a.append(td2Text);
                                        td5a.append(td5Text);
                                        td5a.href = `${matchEnglandId10[0].link}`;
                                        td2.append(td2a);
                                        td5.append(td5a);
                                        th2.append(th2Text);
                                        td1.append(td1Text);
                                        th1.append(img);
                                        tr2.append(td1, td2, td3, td4, td5);
                                        tr.append(th1, th2);
                                        table.append(tr, tr2);
                                        let main = document.querySelector('.content__main');
                                        main.prepend(table);


                                    }


                                    //Если массивы не пусты отображаем данные на странице
                                    if((isEmpty( matchEvropaId15) === false) && (isEmpty( liguaEvropaId15) === false)){
                                        for(let i = 0; i < matchEvropaId15.length; i++) {

                                            let table = document.createElement('table');
                                            let tr = document.createElement('tr');
                                            let tr2 = document.createElement('tr');
                                            let th1 = document.createElement('th');
                                            let img = document.createElement('img');
                                            let th2 = document.createElement('th');
                                            let td1 = document.createElement('td');
                                            let td2 = document.createElement('td');
                                            let td3 = document.createElement('td');
                                            let td4 = document.createElement('td');
                                            let td4span = document.createElement('span');
                                            let td5 = document.createElement('td');
                                            let td2a = document.createElement('a');
                                            let td5a = document.createElement('a');
                                            let th2Text = document.createTextNode(`Европа: ${liguaEvropaId15}`);
                                            let td1Text = document.createTextNode(`${matchEvropaId15[i].time.getHours()}:${matchEvropaId15[i].time.getMinutes()}`);
                                            let td2Text = document.createTextNode(`${matchEvropaId15[i].name}`);
                                            let td4Text = document.createTextNode(`${matchEvropaId15[i].status}`);
                                            let td5Text = document.createTextNode('Подробнее');

                                            td3.className = 'svg-yellow';
                                            table.className = 'main1';
                                            img.src = 'assets/img/svg/flagEurope.svg';
                                            td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                            th2.colSpan = "4";
                                            td4.append(td4span);
                                            td4span.append(td4Text);
                                            td2a.href = `${matchEvropaId15[i].link}`;
                                            td2a.append(td2Text);
                                            td5a.append(td5Text);
                                            td5a.href = `${matchEvropaId15[i].link}`;
                                            td2.append(td2a);
                                            td5.append(td5a);
                                            th2.append(th2Text);
                                            td1.append(td1Text);
                                            th1.append(img);
                                            tr2.append(td1, td2, td3, td4, td5);
                                            tr.append(th1, th2);
                                            table.append(tr, tr2);
                                            let main = document.querySelector('.content__main');
                                            main.prepend(table);

                                        }
                                    }
                                    // console.log(matchEvropaId15);
                                    // console.log(liguaEvropaId15);

                                    //Если массивы не пусты отображаем данные на странице
                                    if((isEmpty( matchEvropaId14) === false) && (isEmpty( liguaEvropaId14) === false)){
                                        for(let i = 0; i < matchEvropaId14.length; i++) {

                                            let table = document.createElement('table');
                                            let tr = document.createElement('tr');
                                            let tr2 = document.createElement('tr');
                                            let th1 = document.createElement('th');
                                            let img = document.createElement('img');
                                            let th2 = document.createElement('th');
                                            let td1 = document.createElement('td');
                                            let td2 = document.createElement('td');
                                            let td3 = document.createElement('td');
                                            let td4 = document.createElement('td');
                                            let td4span = document.createElement('span');
                                            let td5 = document.createElement('td');
                                            let td2a = document.createElement('a');
                                            let td5a = document.createElement('a');
                                            let th2Text = document.createTextNode(`Европа: ${liguaEvropaId14}`);
                                            let td1Text = document.createTextNode(`${matchEvropaId14[i].time.getHours()}:${matchEvropaId14[i].time.getMinutes()}`);
                                            let td2Text = document.createTextNode(`${matchEvropaId14[i].name}`);
                                            let td4Text = document.createTextNode(`${matchEvropaId14[i].status}`);
                                            let td5Text = document.createTextNode('Подробнее');

                                            td3.className = 'svg-opacity';
                                            table.className = 'main1';
                                            img.src = 'assets/img/svg/flagEurope.svg';
                                            td3.innerHTML = '<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Star 2" d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"/></svg>';
                                            th2.colSpan = "4";
                                            td4.append(td4span);
                                            td4span.append(td4Text);
                                            td2a.href = `${matchEvropaId14[i].link}`;
                                            td2a.append(td2Text);
                                            td5a.append(td5Text);
                                            td5a.href = `${matchEvropaId14[i].link}`;
                                            td2.append(td2a);
                                            td5.append(td5a);
                                            th2.append(th2Text);
                                            td1.append(td1Text);
                                            th1.append(img);
                                            tr2.append(td1, td2, td3, td4, td5);
                                            tr.append(th1, th2);
                                            table.append(tr, tr2);
                                            let main = document.querySelector('.content__main');
                                            main.prepend(table);

                                        }
                                    }


                                })
                                 .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));(err => console.log(err));
                        })
                        .catch(err => alert(new Error('Что-то пошло не так, возможно сервер не доступен. Попробуйте перезагрузить страницу.')));

                }
                btn2Result();

                    }


        })
    })

    //проверка на пустоту, если не пустой, то отображаются данные на странице
    function isEmpty(obj) {
        for (let key in obj) {
            // если тело цикла начнет выполняться - значит в объекте есть свойства
            return false;
        }
        return true;
    }
//удаление класса
    function removeClass(){
        // let btn1 = document.querySelector('.btn1__link-number');
        // let btn2 = document.querySelector('.btn2__link-number');
        // btn1.innerHTML = '0';
        // btn2.innerHTML = '0';
        let main1 = document.querySelectorAll('.main1');
        main1.forEach(item =>{
            item.classList.add('display-none')

        });


        btnClickCount.forEach(item =>{
            item.classList.remove('is-active-tab')

        })
    }


})();







