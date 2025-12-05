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
            }
        });
    }

    sell(amount) {
        if (this.inventory > 0) {
             this.inventory -= 1;
             this.money += amount;
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

class GraphRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    updateSummaryGraph(summaryData) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const maxMoney = Math.max(...summaryData.map(d => d.money));
        const barWidth = this.canvas.width / summaryData.length;
        const maxLog = Math.log(maxMoney + 1);

        for (let i = 0; i < summaryData.length; i++) {
            const barHeight = maxLog > 0 ? (Math.log(summaryData[i].money + 1) / maxLog) * (this.canvas.height - 20) : 0;
            this.ctx.fillStyle = 'blue';
            this.ctx.fillRect(i * barWidth + 5, this.canvas.height - barHeight - 20, barWidth - 10, barHeight);
            this.ctx.fillStyle = 'black';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(summaryData[i].label, i * barWidth + barWidth / 2, this.canvas.height - 5);
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
        this.graphRenderer = new GraphRenderer('summary-graph');

        this._initializeActors();
        this.updateUI();
    }

    _initializeActors() {
        this.citizens = [];
        this.companies = [];
        this.banks = [];
        this.governments = [];
        this.utilityProviders = [];

        for (let i = 0; i < 10; i++) {
            this.citizens.push(new Citizen(i));
        }
        for (let i = 0; i < 2; i++) {
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
            this.citizens.forEach(c => government.tax(c, 0.1));
            this.companies.forEach(c => government.tax(c, 0.15));

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

        html += '<h3>Citizens</h3>';
        html += '<ul>';
        this.citizens.forEach(c => {
            html += `<li>ID: ${c.id}, Money: ${c.money.toFixed(2)}, Employer: ${c.employer ? c.employer.id : 'None'}</li>`;
        });
        html += '</ul>';

        html += '<h3>Companies</h3>';
        html += '<ul>';
        this.companies.forEach(c => {
            html += `<li>ID: ${c.id}, Money: ${c.money.toFixed(2)}, Employees: ${c.employees.length}, Inventory: ${c.inventory}</li>`;
        });
        html += '</ul>';

        html += '<h3>Other Actors</h3>';
        html += '<ul>';
        this.banks.forEach(b => {
            html += `<li>Bank ID: ${b.id}, Money: ${b.money.toFixed(2)}</li>`;
        });
        this.governments.forEach(g => {
            html += `<li>Government ID: ${g.id}, Money: ${g.money.toFixed(2)}</li>`;
        });
        this.utilityProviders.forEach(u => {
            html += `<li>Utility Provider ID: ${u.id}, Money: ${u.money.toFixed(2)}</li>`;
        });
        html += '</ul>';


        outputDiv.innerHTML = html;
        this.graphRenderer.updateSummaryGraph([
            { label: 'Citizens', money: this.citizens.reduce((sum, c) => sum + c.money, 0) },
            { label: 'Companies', money: this.companies.reduce((sum, c) => sum + c.money, 0) },
            { label: 'Banks', money: this.banks.reduce((sum, b) => sum + b.money, 0) },
            { label: 'Governments', money: this.governments.reduce((sum, g) => sum + g.money, 0) },
            { label: 'Utilities', money: this.utilityProviders.reduce((sum, u) => sum + u.money, 0) }
        ]);
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
        this.updateUI();
    }
}

const simulation = new Simulation();

document.getElementById('start-btn').addEventListener('click', () => simulation.start());
document.getElementById('pause-btn').addEventListener('click', () => simulation.pause());
document.getElementById('reset-btn').addEventListener('click', () => simulation.reset());
