package budakgpt.yieldgridbackend.modules.auth.exception;

import budakgpt.yieldgridbackend.modules.auth.enums.Role;

public class PrivilegedRoleRegistrationException extends AuthException {
    public PrivilegedRoleRegistrationException(Role role) {
        super("Role '%s' cannot be self-assigned; public registration allows only BUYER or SELLER".formatted(role));
    }
}
