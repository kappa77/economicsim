class Cittadino:
    def __init__(self, nome, denaro=1000):
        self.nome = nome
        self.denaro = denaro

    def __repr__(self):
        return f"Cittadino({self.nome}, {self.denaro})"

class Azienda:
    def __init__(self, nome, capitale=10000):
        self.nome = nome
        self.capitale = capitale
        self.inventario = {}

    def __repr__(self):
        return f"Azienda({self.nome}, {self.capitale})"

class Banca:
    def __init__(self, nome, capitale=100000):
        self.nome = nome
        self.capitale = capitale

    def __repr__(self):
        return f"Banca({self.nome}, {self.capitale})"

class Governo:
    def __init__(self, nome, tesoro=1000000):
        self.nome = nome
        self.tesoro = tesoro

    def __repr__(self):
        return f"Governo({self.nome}, {self.tesoro})"

class FornitoreUtenze:
    def __init__(self, nome, capitale=50000):
        self.nome = nome
        self.capitale = capitale

    def __repr__(self):
        return f"FornitoreUtenze({self.nome}, {self.capitale})"
