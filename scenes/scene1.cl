(scene 
    (camera 
        (vector3 0 0 0) 
        (vector3 1 1 1)) 
    (union (list 
        (sphere 
            (vector3 0 -5001 0)
            5000
            (material 
                (color 1 1 0)
                1000)) 
        (sphere 
            (vector3 0 -1 3)
            1
            (material 
                (color 1 0 0)
                500)) 
        (sphere 
            (vector3 2 0 4)
            1
            (material 
                (color 0 0 1)
                500))
        (sphere 
            (vector3 -2 0 4)
            1
            (material 
                (color 0 1 0)
                10)))) 
    (list 
        (ambiant_light
            0.2) 
        (omni_directional_light
            0.6
            (vector3 2 1 0)) 
        (directional_light
            0.2
            (vector3 1 4 4))))