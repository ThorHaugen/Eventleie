package no.eventleie.mannskap.model;

public enum Rolle {
    SJEF,
    UTVIKLER,
    ADMIN,
    ANSATT;

    public int niva() {
        return switch (this) {
            case SJEF -> 3;
            case UTVIKLER -> 2;
            case ADMIN -> 1;
            case ANSATT -> 0;
        };
    }
}
