# Top10 REST API Documentation
All restricted endpoints must include a `Bearer <token>` in the Auth header

- `/posts`
    - `GET`
        - Unrestricted
        - Returns all the posts on the platform
    - `POST`
        - Restricted
        - **Takes a JSON body**
        - Example body:
        - ```
            {
                "title": "Example Title" <required>,
                "description": "Example Description" <not required>
            }
          ```
    - `/posts/<postId>`
        - `GET`
            - Unrestricted
            - Returns the info for the given post
        - `PATCH`
            - Restricted
            - Include fields you want to modify in the body (json body)
        - `DELETE`
            - Restricted
            - Deletes the given post
- `/postlets`
    - `GET`
        - Unrestricted
        - Returns all postlets
    - `POST`
        - Restricted
        - **Takes form data**
        - Example body: 
        - ```
            {
                "numbering": 1 <required>,
                "title": "best boat ever" <not required>,
                "description": "this is the best boat" <not required>,
                "postletImage": image.jpg,
                "postId": <the ID of the associated post, required>
            }
          ```
    - `/postlets/<postletId>`
        - `GET`
            - Untrestricted
            - Returns the info for this postlet
        - `PATCH`
            - Restricted
            - Include the fields you want to modify in the body (form data)
            - Supports updating of image
        - `DELETE`
            - Restricted
            - Deletes the given postlet
- /user