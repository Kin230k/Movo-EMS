CREATE TABLE ROLE_ACTIONS (
    roleActionsId UUID PRIMARY KEY,
    roleId UUID NOT NULL,
    actionId UUID NOT NULL,
    UNIQUE (roleId, actionId),
    FOREIGN KEY (roleId) REFERENCES ROLES(roleId),
    FOREIGN KEY (actionId) REFERENCES ACTIONS(actionId)
);