(defparameter scene (Scene 
    (Camera 
        (Vector3 0 0 0) 
        (Vector3 1 1 1)) 
    (UnionSDF (list 
        (SphereSDF 
            (Vector3 0 -5001 0)
            5000
            (Material 
                (color 1 1 0)
                1000)) 
        (SphereSDF 
            (Vector3 0 -1 3)
            1
            (Material 
                (color 1 0 0)
                500)) 
        (SphereSDF 
            (Vector3 2 0 4)
            1
            (Material 
                (color 0 0 1)
                500)) 
        (SphereSDF 
            (Vector3 -2 0 4)
            1
            (Material 
                (color 0 1 0)
                10)))) 
    (list 
        (AmbiantLight
            0.2) 
        (OmniDirectionalLight
            0.6
            (Vector3 2 1 0)) 
        (DirectionalLight
            0.2
            (Vector3 1 4 4)))))