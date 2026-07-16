package budakgpt.yieldgridbackend.modules.auth.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auth_entities")
@Getter
@Setter
@NoArgsConstructor
public class AuthEntity extends BaseEntity {
    // TODO: add domain fields for Auth
}
