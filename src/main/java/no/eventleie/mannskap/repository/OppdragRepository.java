package no.eventleie.mannskap.repository;

import no.eventleie.mannskap.model.Oppdrag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface OppdragRepository extends JpaRepository<Oppdrag, UUID> {

    List<Oppdrag> findAllByOrderByDatoAscKlokkeslettAsc();

    List<Oppdrag> findAllByDatoGreaterThanEqualOrderByDatoAscKlokkeslettAsc(LocalDate dato);

    @Query("""
            select t.oppdrag from Tildeling t
            where t.ansatt.id = :ansattId
            order by t.oppdrag.dato asc, t.oppdrag.klokkeslett asc
            """)
    List<Oppdrag> finnForAnsatt(@Param("ansattId") UUID ansattId);
}
