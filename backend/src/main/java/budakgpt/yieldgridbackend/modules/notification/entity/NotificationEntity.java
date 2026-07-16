package budakgpt.yieldgridbackend.modules.notification.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification_entities")
@Getter
@Setter
@NoArgsConstructor
public class NotificationEntity extends BaseEntity {
    // TODO: add domain fields for Notification
}
