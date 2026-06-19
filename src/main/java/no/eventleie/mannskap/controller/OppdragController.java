package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.dto.OppdragDto;
import no.eventleie.mannskap.dto.OppdragRequest;
import no.eventleie.mannskap.model.*;
import no.eventleie.mannskap.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/oppdrag")
public class OppdragController {

    private final OppdragRepository oppdragRepo;
    private final AnsattRepository ansattRepo;
    private final KjoretoyRepository kjoretoyRepo;
    private final LogistikkmalRepository malRepo;

    public OppdragController(OppdragRepository oppdragRepo, AnsattRepository ansattRepo,
                             KjoretoyRepository kjoretoyRepo, LogistikkmalRepository malRepo) {
        this.oppdragRepo = oppdragRepo;
        this.ansattRepo = ansattRepo;
        this.kjoretoyRepo = kjoretoyRepo;
        this.malRepo = malRepo;
    }

    @GetMapping
    public List<OppdragDto> alle() {
        return oppdragRepo.findAllByOrderByDatoAscKlokkeslettAsc()
                .stream().map(OppdragDto::fra).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OppdragDto> hent(@PathVariable UUID id) {
        return oppdragRepo.findById(id)
                .map(o -> ResponseEntity.ok(OppdragDto.fra(o)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public OppdragDto opprett(@RequestBody OppdragRequest req) {
        Oppdrag o = new Oppdrag();
        bruk(req, o);
        return OppdragDto.fra(oppdragRepo.save(o));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<OppdragDto> oppdater(@PathVariable UUID id, @RequestBody OppdragRequest req) {
        return oppdragRepo.findById(id).map(o -> {
            bruk(req, o);
            return ResponseEntity.ok(OppdragDto.fra(oppdragRepo.save(o)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> slett(@PathVariable UUID id) {
        if (!oppdragRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        oppdragRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void bruk(OppdragRequest req, Oppdrag o) {
        o.setDato(req.dato);
        o.setKlokkeslett(req.klokkeslett);
        o.setKunde(req.kunde);
        o.setSted(req.sted);
        o.setAdresse(req.adresse);
        o.setMaksAntall(req.maksAntall);
        if (req.type != null) {
            o.setType(OppdragType.valueOf(req.type));
        }
        o.setNotat(req.notat);
        o.setKjoretoy(req.kjoretoyId != null ? kjoretoyRepo.findById(req.kjoretoyId).orElse(null) : null);
        o.setMal(req.malId != null ? malRepo.findById(req.malId).orElse(null) : null);

        if (req.ansattIder != null) {
            synkroniserMannskap(o, req.ansattIder);
        }
    }

    private void synkroniserMannskap(Oppdrag o, List<UUID> ansattIder) {
        o.getTildelinger().removeIf(t -> !ansattIder.contains(t.getAnsatt().getId()));
        for (UUID aid : ansattIder) {
            boolean finnes = o.getTildelinger().stream()
                    .anyMatch(t -> t.getAnsatt().getId().equals(aid));
            if (!finnes) {
                ansattRepo.findById(aid).ifPresent(a ->
                        o.getTildelinger().add(new Tildeling(a, o, false)));
            }
        }
    }
}
