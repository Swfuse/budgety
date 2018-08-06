
// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;

        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,

    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //Create new id
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            //Create new item inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //Push into structure
            data.allItems[type].push(newItem);

            //Return new element
            return newItem;

        },

        deleteItem: function(type, id) {
            var ids, index;
            // id = 3
            //data.allItems[type][id]
            // [1 2 3 4 5]
            // index = 2

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // calculate total incomes and expenses
            calculateTotal('exp');
            calculateTotal('inc');


            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

            

            // exp = 100 and inc 300, spent 33.3333% == 100/300 = 0,333 * 100
        },

        calculatePercentages: function() {
            /*
            a=20
            b=30
            c=40
            inc = 100
            a=20/100=20%
             */
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function() {
            console.log(data);
        }
    };


})();



// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDscr: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',

    };
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        // + or -
        // 2 decimal points
        // comma separate thousands
        // 2000 -> 2,000.00

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);  // 2310 -> 2,310
        }

        dec = numSplit[1]; 
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i ++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be exp or inc
                description: document.querySelector(DOMstrings.inputDscr).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),

                

            };

        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            // Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDscr + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);
            

            fieldsArr.forEach(function(current, index, fieldsArr) {
                current.value = "";
                
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },


        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields, function(current,index){
                // DO stuff
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });


        },

        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            months = ['Jun', 'Feb', 'Mrch', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function() {
             var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDscr + ',' + DOMstrings.inputValue
             );

             nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
             });

             document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
             
        },

        getDomStrings: function() {
            return DOMstrings
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDomStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
    
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
    
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };



    var updateBudget = function() {

        // 1 Calculate the budget
        budgetCtrl.calculateBudget();

        // 2 return the budget
        var budget = budgetCtrl.getBudget();

        // 3 Display the budget on ui
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {
        // Calculate percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update ui
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function() {
        var input, newItem;

        // 1 Get input data from field
        input = UICtrl.getInput();

        if(input.description!== "" && !isNaN(input.value) && input.value > 0) {
            // 2 Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3 Add item to the ui
            UICtrl.addListItem(newItem, input.type);

            // 4 Clear the fields
            UICtrl.clearFields();

            // 5 Calculate and update budget
            updateBudget();

            // 6 Calculate and update perc
            updatePercentages();
        }
        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID){ 
            //inc-1
            // [inc, 1]
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete item from ui
            UICtrl.deleteListItem(itemID);

            // update, show new budget
            updateBudget();

            //update perc
            updatePercentages();

        }
    };

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);

controller.init();



