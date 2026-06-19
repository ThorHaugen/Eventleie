package no.eventleie.mannskap.config;

import no.eventleie.mannskap.repository.AnsattRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final AnsattRepository ansattRepository;

    public SecurityConfig(AnsattRepository ansattRepository) {
        this.ansattRepository = ansattRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return brukernavn -> ansattRepository.findByBrukernavn(brukernavn)
                .map(a -> User.withUsername(a.getBrukernavn())
                        .password(a.getPassordHash())
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + a.getRolle().name())))
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Fant ikke bruker: " + brukernavn));
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/mine-oppdrag/**").authenticated()
                        .requestMatchers("/api/meg", "/api/meg/**").authenticated()
                        .requestMatchers("/api/vakter/**").authenticated()
                        .requestMatchers("/api/oppdrag/**").hasAnyRole("ADMIN", "SJEF", "UTVIKLER")
                        .requestMatchers("/api/ansatte/**").hasAnyRole("ADMIN", "SJEF", "UTVIKLER")
                        .requestMatchers("/api/kjoretoy/**").hasAnyRole("ADMIN", "SJEF", "UTVIKLER")
                        .requestMatchers("/api/maler/**").hasAnyRole("ADMIN", "SJEF", "UTVIKLER")
                        .anyRequest().authenticated())
                .httpBasic(basic -> {})
                .headers(h -> h.frameOptions(f -> f.disable()));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://eventleie.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
