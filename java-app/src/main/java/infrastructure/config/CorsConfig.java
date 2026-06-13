package infrastructure.config;

import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configurable
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Permite CORS en todos los endpoints de tu API
                .allowedOrigins("http://localhost:4200") // Permite que Angular se conecte
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos permitidos
                .allowedHeaders("Authorization", "*") // Permite cualquier header (útil para el token JWT luego) y Authorization
                .exposedHeaders("Authorization")
                .allowCredentials(true);
    }
}
