package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.dto.OppdragDto;
import no.eventleie.mannskap.model.Ansatt;
import no.eventleie.mannskap.model.TildelingStatus;
import no.eventleie.mannskap.repository.AnsattRepository;
import no.eventleie.mannskap.repository.OppdragRepository;
import no.eventleie.mannskap.repository.TildelingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
                .stream().map(o -> OppdragDto.fraForAnsatt(o, meg.getId())).toList();
    }

    @PostMapping("/{oppdragId}/fravaer")
    public ResponseEntity<Void> fravaer(
            @PathVariable UUID oppdragId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        Ansatt meg = innloggetAnsatt(auth);
        return tildelingRepo.findByAnsattIdAndOppdragId(meg.getId(), oppdragId)
                .map(t -> {
                    t.setStatus(TildelingStatus.FRAVAER);
                    t.setFravaerBegrunnelse(body.getOrDefault("begrunnelse", ""));
                    t.setSett(true);
                    tildelingRepo.save(t);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{oppdragId}/kvitter")
    public ResponseEntity<Void> kvitter(@PathVariable UUID oppdragId, Authentication auth) {
        Ansatt meg = innloggetAnsatt(auth);
        return tildelingRepo.findByAnsattIdAndOppdragId(meg.getId(), oppdragId)
                .map(t -> {
                    t.setSett(true);
                    tildelingRepo.save(t);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{oppdragId}")
    public ResponseEntity<Void> trekkDeg(@PathVariable UUID oppdragId, Authentication auth) {
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
