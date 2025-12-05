from src.models.attori import Cittadino, Azienda, Banca, Governo, FornitoreUtenze

class Simulazione:
    def __init__(self):
        self.turno = 0
        self.cittadini = [Cittadino("Mario"), Cittadino("Giovanni")]
        self.aziende = [Azienda("TechCorp"), Azienda("FoodInc")]
        self.banche = [Banca("Banca Centrale")]
        self.governo = Governo("Stato")
        self.fornitori_utenze = [FornitoreUtenze("EnergyPlus")]

    def avanza_turno(self):
        self.turno += 1
        # Logica di interazione semplificata
        # Per ora, facciamo solo che ogni cittadino paghi le utenze
        for cittadino in self.cittadini:
            cittadino.denaro -= 50
            self.fornitori_utenze[0].capitale += 50

    def get_stato(self):
        return {
            "turno": self.turno,
            "cittadini": [c.__dict__ for c in self.cittadini],
            "aziende": [a.__dict__ for a in self.aziende],
            "banche": [b.__dict__ for b in self.banche],
            "governo": self.governo.__dict__,
            "fornitori_utenze": [f.__dict__ for f in self.fornitori_utenze]
        }
