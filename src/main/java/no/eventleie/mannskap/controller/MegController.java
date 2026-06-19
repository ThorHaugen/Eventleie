package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.repository.AnsattRepository;
import no.eventleie.mannskap.repository.TildelingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/meg")
public class MegController {

    private final AnsattRepository ansattRepo;
    private final TildelingRepository tildelingRepo;
    private final PasswordEncoder passordKoder;

    public MegController(AnsattRepository ansattRepo, TildelingRepository tildelingRepo, PasswordEncoder passordKoder) {
        this.ansattRepo = ansattRepo;
        this.tildelingRepo = tildelingRepo;
        this.passordKoder = passordKoder;
    }

    @GetMapping("/varsler")
    public ResponseEntity<?> varsler(@AuthenticationPrincipal UserDetails bruker) {
        return ansattRepo.findByBrukernavn(bruker.getUsername()).map(a -> {
            long antall = tildelingRepo.countByAnsattIdAndSettFalse(a.getId());
            return ResponseEntity.ok(Map.of("antall", antall));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/passord")
    public ResponseEntity<?> endrePassord(
            @AuthenticationPrincipal UserDetails bruker,
            @RequestBody Map<String, String> body) {
        String gammelt = body.get("gammelt");
        String nytt = body.get("nytt");
        return ansattRepo.findByBrukernavn(bruker.getUsername()).map(a -> {
            if (!passordKoder.matches(gammelt, a.getPassordHash())) {
                return ResponseEntity.status(403).body("Feil gammelt passord.");
            }
            a.setPassordHash(passordKoder.encode(nytt));
            ansattRepo.save(a);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/brukernavn")
    public ResponseEntity<?> endreBrukernavn(
            @AuthenticationPrincipal UserDetails bruker,
            @RequestBody Map<String, String> body) {
        String nyttBrukernavn = body.get("brukernavn");
        if (nyttBrukernavn == null || nyttBrukernavn.isBlank()) {
            return ResponseEntity.badRequest().body("Brukernavn kan ikke være tomt.");
        }
        if (ansattRepo.findByBrukernavn(nyttBrukernavn).isPresent()) {
            return ResponseEntity.badRequest().body("Brukernavnet er allerede i bruk.");
        }
        return ansattRepo.findByBrukernavn(bruker.getUsername()).map(a -> {
            a.setBrukernavn(nyttBrukernavn);
            ansattRepo.save(a);
            return ResponseEntity.ok(Map.of("brukernavn", nyttBrukernavn));
        }).orElse(ResponseEntity.notFound().build());
    }
}
