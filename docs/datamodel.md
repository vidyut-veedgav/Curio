# Data Model

## user

| Attribute | Data Type | Key Type | FK Reference | Description | Required | Validation / Rules |
|-----------|-----------|----------|--------------|-------------|----------|-------------------|
| user_id | UUID | PK | | Unique identifier for a user | Y | |
| first_name | Text | | | User's first name | Y | |
| last_name | Text | | | User's last name | Y | |
| email | Text | | | User's contact information | Y | |
| bio | Text | | | Information about the user's background and experience, used to inform better learning paths | N | |

## learning_session

| Attribute | Data Type | Key Type | FK Reference | Description | Required | Validation / Rules |
|-----------|-----------|----------|--------------|-------------|----------|-------------------|
| learning_session_id | UUID | PK | | Unique identifier for a learning session | Y | |
| user_id | UUID | FK | user.user_id | Owner of the learning session | Y | |
| name | Text | | | Name of the learning session | Y | |
| description | Text | | | Describes the purpose and intent of creating the learning session | Y | |
| original_prompt | Text | | | User's original prompt about what they want to learn and any additional requests about the experience | N | |

## module

| Attribute | Data Type | Key Type | FK Reference | Description | Required | Validation / Rules |
|-----------|-----------|----------|--------------|-------------|----------|-------------------|
| module_id | UUID | PK | | Unique identifier for a module | Y | |
| learning_sesion_id | UUID | FK | learning_session.learning_session_id | A module is associated with a learning_session | Y | |
| name | Text | | | Name of the module | Y | |
| overview | Text | | | AI-generated overview of the module | Y | |
| order | Num | | | Order of the module in the learning session | Y | |
| is_complete | Bool | | | True if the user has completed this module | Y | |

## chat_message

| Attribute | Data Type | Key Type | FK Reference | Description | Required | Validation / Rules |
|-----------|-----------|----------|--------------|-------------|----------|-------------------|
| chat_message_id | UUID | PK | | Unique identifier for a chat_message | Y | |
| module_id | UUID | FK | module.module_id | A chat message is associated with a module | Y | |
| content | Text | | | Message content | Y | |
| author | Enum | | | "User" or "AI" | Y | |
| order | Num | | | Order of the message in the chat history | Y | |