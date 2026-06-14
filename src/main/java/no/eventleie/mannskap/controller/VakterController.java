package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.dto.OppdragDto;
import no.eventleie.mannskap.model.Ansatt;
import no.eventleie.mannskap.model.Tildeling;
import no.eventleie.mannskap.model.TildelingStatus;
import no.eventleie.mannskap.repository.AnsattRepository;
import no.eventleie.mannskap.repository.OppdragRepository;
import no.eventleie.mannskap.repository.TildelingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vakter")
public class VakterController {

    private final OppdragRepository oppdragRepo;
    private final AnsattRepository ansattRepo;
    private final TildelingRepository tildelingRepo;

    public VakterController(OppdragRepository oppdragRepo, AnsattRepository ansattRepo,
                            TildelingRepository tildelingRepo) {
        this.oppdragRepo = oppdragRepo;
        this.ansattRepo = ansattRepo;
        this.tildelingRepo = tildelingRepo;
    }

    @GetMapping
    public List<OppdragDto> alleVakter(Authentication auth) {
        Ansatt meg = innloggetAnsatt(auth);
        return oppdragRepo.findAllByDatoGreaterThanEqualOrderByDatoAscKlokkeslettAsc(LocalDate.now())
                .stream()
                .map(o -> OppdragDto.fraForAnsatt(o, meg.getId()))
                .toList();
    }

    @PostMapping("/{oppdragId}/ta")
    public ResponseEntity<Void> taVakt(@PathVariable UUID oppdragId, Authentication auth) {
        Ansatt meg = innloggetAnsatt(auth);

        if (tildelingRepo.findByAnsattIdAndOppdragId(meg.getId(), oppdragId).isPresent()) {
            return ResponseEntity.noContent().build();
        }

        return oppdragRepo.findById(oppdragId)
                .map(o -> {
                    tildelingRepo.save(new Tildeling(meg, o));
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{oppdragId}/ta")
    public ResponseEntity<Void> trekkVakt(@PathVariable UUID oppdragId, Authentication auth) {
        Ansatt meg = innloggetAnsatt(auth);
        return tildelingRepo.findByAnsattIdAndOppdragId(meg.getId(), oppdragId)
                .map(t -> {
                    tildelingRepo.delete(t);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Ansatt innloggetAnsatt(Authentication auth) {
        return ansattRepo.findByBrukernavn(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Innlogget bruker mangler i databasen"));
    }
}
