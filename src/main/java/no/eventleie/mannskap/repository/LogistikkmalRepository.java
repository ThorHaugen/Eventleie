package no.eventleie.mannskap.repository;

import no.eventleie.mannskap.model.Logistikkmal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface LogistikkmalRepository extends JpaRepository<Logistikkmal, UUID> {
}
