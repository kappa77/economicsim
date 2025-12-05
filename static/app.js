document.addEventListener('DOMContentLoaded', () => {
    const statoSimulazione = document.getElementById('stato-simulazione');
    const avanzaTurnoBtn = document.getElementById('avanza-turno');

    const aggiornaStato = async () => {
        const response = await fetch('/api/stato');
        const data = await response.json();
        statoSimulazione.textContent = JSON.stringify(data, null, 2);
    };

    avanzaTurnoBtn.addEventListener('click', async () => {
        const response = await fetch('/api/avanza_turno', { method: 'POST' });
        const data = await response.json();
        statoSimulazione.textContent = JSON.stringify(data, null, 2);
    });

    aggiornaStato();
});
