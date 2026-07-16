package budakgpt.yieldgridbackend.modules.user.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_entities")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity extends BaseEntity {
    // TODO: add domain fields for User
}
