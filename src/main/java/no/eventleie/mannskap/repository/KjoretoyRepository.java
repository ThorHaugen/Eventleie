package no.eventleie.mannskap.repository;

import no.eventleie.mannskap.model.Kjoretoy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface KjoretoyRepository extends JpaRepository<Kjoretoy, UUID> {
}
