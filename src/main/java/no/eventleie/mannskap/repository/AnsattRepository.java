package no.eventleie.mannskap.repository;

import no.eventleie.mannskap.model.Ansatt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnsattRepository extends JpaRepository<Ansatt, UUID> {
    Optional<Ansatt> findByBrukernavn(String brukernavn);
}
