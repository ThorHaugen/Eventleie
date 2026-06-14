package no.eventleie.mannskap.repository;

import no.eventleie.mannskap.model.Tildeling;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TildelingRepository extends JpaRepository<Tildeling, UUID> {
    Optional<Tildeling> findByAnsattIdAndOppdragId(UUID ansattId, UUID oppdragId);
}
