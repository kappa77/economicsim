class Citizen {
    constructor(id) {
        this.id = id;
        this.money = 1000;
        this.employer = null;
        this.salary = 0;
    }

    work() {
        if (this.employer) {
            return 10;
        }
        return 0;
    }

    consume(price) {
        if (this.money >= price) {
            this.money -= price;
            return price;
        }
        return 0;
    }
}

class Company {
    constructor(id) {
        this.id = id;
        this.money = 10000;
        this.employees = [];
        this.inventory = 0;
        this.price = 12;
        this.money_in = 0;
        this.money_out = 0;
    }

    hire(citizen) {
        if (!this.employees.includes(citizen)) {
            this.employees.push(citizen);
            citizen.employer = this;
            citizen.salary = 50;
        }
    }

    produce() {
        let totalValue = 0;
        this.employees.forEach(employee => {
            totalValue += employee.work();
        });
        this.inventory += totalValue;
    }

    paySalaries() {
        this.employees.forEach(employee => {
            if (this.money >= employee.salary) {
                this.money -= employee.salary;
                employee.money += employee.salary;
                this.money_out += employee.salary;
            }
        });
    }

    sell(amount) {
        if (this.inventory > 0) {
             this.inventory -= 1;
             this.money += amount;
             this.money_in += amount;
             return amount;
        }
        return 0;
    }
}

class Bank {
    constructor(id) {
        this.id = id;
        this.money = 100000;
        this.loans = [];
    }

    lend(actor, amount) {
        if (this.money >= amount) {
            this.money -= amount;
            actor.money += amount;
            this.loans.push({ actor, amount, interestRate: 0.05 });
            return true;
        }
        return false;
    }

    collectInterest() {
        this.loans.forEach(loan => {
            const interest = loan.amount * loan.interestRate;
            if (loan.actor.money >= interest) {
                loan.actor.money -= interest;
                this.money += interest;
            }
        });
    }
}

class Government {
    constructor(id) {
        this.id = id;
        this.money = 500000;
    }

    tax(actor, rate) {
        if (actor instanceof Citizen && actor.money < 1.25) {
            return;
        }
        const taxAmount = actor.money * rate;
        if (actor.money >= taxAmount) {
            actor.money -= taxAmount;
            this.money += taxAmount;
        }
    }

    tax_company(company, rate) {
        const profit = company.money_in - company.money_out;
        if (profit > 0) {
            const taxAmount = profit * rate;
            if (company.money >= taxAmount) {
                company.money -= taxAmount;
                this.money += taxAmount;
            }
        }
    }
}

class UtilityProvider {
    constructor(id) {
        this.id = id;
        this.money = 20000;
    }

    charge(actor, amount) {
        if (actor.money >= amount) {
            actor.money -= amount;
            this.money += amount;
        }
    }
}

class BarGraphRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    updateSummaryGraph(summaryData) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const maxMoney = Math.max(...summaryData.map(d => d.money));
        const barWidth = this.canvas.width / summaryData.length;
        const maxLog = Math.log(maxMoney + 1);

        const colors = ['blue', 'green', 'red', 'purple', 'orange'];

        for (let i = 0; i < summaryData.length; i++) {
            const barHeight = maxLog > 0 ? (Math.log(summaryData[i].money + 1) / maxLog) * (this.canvas.height - 20) : 0;
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.fillRect(i * barWidth + 5, this.canvas.height - barHeight - 20, barWidth - 10, barHeight);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(summaryData[i].label, i * barWidth + barWidth / 2, this.canvas.height - 5);
        }
    }
}

class TemporalGraphRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    updateTemporalGraph(history) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (history.length < 2) {
            return;
        }

        const allMoney = history.flat().map(d => d.money);
        const maxMoney = Math.max(...allMoney) || 1;
        const maxLog = Math.log(maxMoney + 1);

        const colors = ['blue', 'green', 'red', 'purple', 'orange'];
        const labels = history[0].map(d => d.label);

        for (let i = 0; i < labels.length; i++) {
            this.ctx.strokeStyle = colors[i % colors.length];
            this.ctx.beginPath();
            for (let j = 0; j < history.length; j++) {
                const x = (j / (history.length - 1)) * (this.canvas.width - 80);
                const y = this.canvas.height - (Math.log(history[j][i].money + 1) / maxLog) * this.canvas.height;
                if (j === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }

        for (let i = 0; i < labels.length; i++) {
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.fillRect(this.canvas.width - 70, i * 20 + 10, 10, 10);
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(labels[i], this.canvas.width - 55, i * 20 + 20);
        }
    }
}

class Simulation {
    constructor() {
        this.citizens = [];
        this.companies = [];
        this.banks = [];
        this.governments = [];
        this.utilityProviders = [];
        this.turn = 0;
        this.intervalId = null;
        this.graphRenderer = new BarGraphRenderer('summary-graph');
        this.temporalGraphRenderer = new TemporalGraphRenderer('temporal-graph');
        this.history = [];
        this.taxRate = 0.1;

        this._initializeActors();
        this.updateUI();
    }

    _initializeActors() {
        this.citizens = [];
        this.companies = [];
        this.banks = [];
        this.governments = [];
        this.utilityProviders = [];

        const numCitizens = parseInt(document.getElementById('num-citizens').value, 10);
        const numCompanies = parseInt(document.getElementById('num-companies').value, 10);
        this.taxRate = parseFloat(document.getElementById('tax-rate').value);

        for (let i = 0; i < numCitizens; i++) {
            this.citizens.push(new Citizen(i));
        }
        for (let i = 0; i < numCompanies; i++) {
            this.companies.push(new Company(i));
        }
        this.banks.push(new Bank(0));
        this.governments.push(new Government(0));
        this.utilityProviders.push(new UtilityProvider(0));
    }

    runTurn() {
        // 1. Negotiation/Hiring/Loans
        this.companies.forEach(company => {
            this.citizens.forEach(citizen => {
                if (!citizen.employer && Math.random() < 0.1) {
                    company.hire(citizen);
                }
            });
            if(company.money < 1000 && this.banks.length > 0){
                this.banks[0].lend(company, 5000);
            }
        });

        // 2. Production
        this.companies.forEach(company => company.produce());

        // 3. Commercial
        this.companies.forEach(company => company.paySalaries());

        this.citizens.forEach(citizen => {
            if (this.companies.length > 0) {
                // Citizen buys from a random company
                const company = this.companies[Math.floor(Math.random() * this.companies.length)];
                const amountSpent = citizen.consume(company.price);
                if (amountSpent > 0) {
                    company.sell(amountSpent);
                }
            }
        });

        // 4. Other actors
        if(this.banks.length > 0) this.banks[0].collectInterest();
        if(this.governments.length > 0) {
            const government = this.governments[0];
            this.citizens.forEach(c => government.tax(c, this.taxRate));

            if (this.turn > 0 && this.turn % 10 === 0) {
                this.companies.forEach(c => {
                    government.tax_company(c, this.taxRate + 0.05);
                    c.money_in = 0;
                    c.money_out = 0;
                });
            }

            const employedCitizens = this.citizens.filter(c => c.employer);
            const totalSalary = employedCitizens.reduce((sum, c) => sum + c.salary, 0);
            const averageSalary = employedCitizens.length > 0 ? totalSalary / employedCitizens.length : 0;

            this.citizens.forEach(citizen => {
                if (!citizen.employer) {
                    const unemploymentBenefit = averageSalary * 0.8;
                    if (government.money >= unemploymentBenefit) {
                        government.money -= unemploymentBenefit;
                        citizen.money += unemploymentBenefit;
                    }
                }
            });
        }
        if(this.utilityProviders.length > 0){
            const utilityProvider = this.utilityProviders[0];
            this.citizens.forEach(c => utilityProvider.charge(c, 20));
            this.companies.forEach(c => utilityProvider.charge(c, 100));
        }

        this.turn++;
        this.updateUI();
    }

    updateUI() {
        const outputDiv = document.getElementById('simulation-output');
        let html = `<h2>Turn: ${this.turn}</h2>`;

        const citizenTotalMoney = this.citizens.reduce((sum, c) => sum + c.money, 0);
        const companyTotalMoney = this.companies.reduce((sum, c) => sum + c.money, 0);
        const bankTotalMoney = this.banks.reduce((sum, b) => sum + b.money, 0);
        const governmentTotalMoney = this.governments.reduce((sum, g) => sum + g.money, 0);
        const utilityTotalMoney = this.utilityProviders.reduce((sum, u) => sum + u.money, 0);

        html += '<h3>Summary</h3>';
        html += '<table><thead><tr><th>Category</th><th>Count</th><th>Total Money</th></tr></thead><tbody>';
        html += `<tr><td>Citizens</td><td>${this.citizens.length}</td><td>${citizenTotalMoney.toFixed(2)}</td></tr>`;
        html += `<tr><td>Companies</td><td>${this.companies.length}</td><td>${companyTotalMoney.toFixed(2)}</td></tr>`;
        html += `<tr><td>Banks</td><td>${this.banks.length}</td><td>${bankTotalMoney.toFixed(2)}</td></tr>`;
        html += `<tr><td>Governments</td><td>${this.governments.length}</td><td>${governmentTotalMoney.toFixed(2)}</td></tr>`;
        html += `<tr><td>Utility Providers</td><td>${this.utilityProviders.length}</td><td>${utilityTotalMoney.toFixed(2)}</td></tr>`;
        html += '</tbody></table>';

        outputDiv.innerHTML = html;
        const summaryData = [
            { label: 'Citizens', money: citizenTotalMoney },
            { label: 'Companies', money: companyTotalMoney },
            { label: 'Banks', money: bankTotalMoney },
            { label: 'Governments', money: governmentTotalMoney },
            { label: 'Utilities', money: utilityTotalMoney }
        ];
        this.graphRenderer.updateSummaryGraph(summaryData);
        this.history.push(summaryData);
        this.temporalGraphRenderer.updateTemporalGraph(this.history);
    }

    start() {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => this.runTurn(), 100);
        }
    }

    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.pause();
        this._initializeActors();
        this.turn = 0;
        this.history = [];
        this.updateUI();
        this.temporalGraphRenderer.updateTemporalGraph(this.history);
    }
}

const simulation = new Simulation();

document.getElementById('start-btn').addEventListener('click', () => simulation.start());
document.getElementById('pause-btn').addEventListener('click', () => simulation.pause());
document.getElementById('reset-btn').addEventListener('click', () => simulation.reset());
