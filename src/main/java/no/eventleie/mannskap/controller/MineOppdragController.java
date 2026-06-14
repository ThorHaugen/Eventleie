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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mine-oppdrag")
public class MineOppdragController {

    private final OppdragRepository oppdragRepo;
    private final AnsattRepository ansattRepo;
    private final TildelingRepository tildelingRepo;

    public MineOppdragController(OppdragRepository oppdragRepo, AnsattRepository ansattRepo,
                                 TildelingRepository tildelingRepo) {
        this.oppdragRepo = oppdragRepo;
        this.ansattRepo = ansattRepo;
        this.tildelingRepo = tildelingRepo;
    }

    @GetMapping
    public List<OppdragDto> mine(Authentication auth) {
        Ansatt meg = innloggetAnsatt(auth);
        return oppdragRepo.finnForAnsatt(meg.getId())
                .stream().map(OppdragDto::fra).toList();
    }

    @PostMapping("/{oppdragId}/bekreft")
    public ResponseEntity<Void> bekreft(@PathVariable UUID oppdragId, Authentication auth) {
        return settStatus(oppdragId, auth, TildelingStatus.BEKREFTET);
    }

    @PostMapping("/{oppdragId}/fravaer")
    public ResponseEntity<Void> fravaer(@PathVariable UUID oppdragId, Authentication auth) {
        return settStatus(oppdragId, auth, TildelingStatus.FRAVAER);
    }

    private ResponseEntity<Void> settStatus(UUID oppdragId, Authentication auth, TildelingStatus status) {
        Ansatt meg = innloggetAnsatt(auth);
        return tildelingRepo.findByAnsattIdAndOppdragId(meg.getId(), oppdragId)
                .map(t -> {
                    t.setStatus(status);
                    tildelingRepo.save(t);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Ansatt innloggetAnsatt(Authentication auth) {
        return ansattRepo.findByBrukernavn(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Innlogget bruker mangler i databasen"));
    }
}
