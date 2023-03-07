; Elements of a scene
(defun Vector3 (x y z) 
    (list :x x :y y :z z))
(defun Camera (position view_port) 
    (list :position position :view_port view_port))
(defun Color (r g b) 
    (list :r r :g g :b b))
(defun Material (color specular) 
    (list :color color :specular specular))
(defun SphereSDF (position radius material) 
    (list :position position :radius radius :material material))
(defun UnionSDF (nodes) 
    (list :nodes nodes))
(defun AmbiantLight (intensity) 
    (list :intensity intensity))
(defun OmniDirectionalLight (intensity position) 
    (list :intensity intensity :position position))
(defun DirectionalLight (intensity direction) 
    (list :intensity intensity :direction direction))
(defun Scene (camera root lights) 
    (list :camera camera :root root :lights lights))

; Ray and hit stuff
(defun Ray (origin position) 
    (list :origin origin :position position))
(defun Hit (position normal material) 
    (list :position position :normal normal :material material))

; Draw stuff
(defun draw_pixel_dummy (u v color)
    (format t "~a ~a ~s~%" u v color))

; Render staff
(defun c_mul_s (c o)
    (Color 
        (* (getf c :r) o)
        (* (getf c :g) o)
        (* (getf c :b) o)))

(defun v3_mul_v3 (v o)
    (Vector3 
        (* (getf v :x) (getf o :x))
        (* (getf v :y) (getf o :y))
        (* (getf v :z) (getf o :z))))

(defun v3_inv (v)
    (Vector3 
        (- (getf v :x))
        (- (getf v :y))
        (- (getf v :z))))


(defun compute_light (lights hit inverse_direction) 
    1)

(defun hit_node (node ray) nil)

(defun hit_in_scene (scene ray) 
    (hit_node (getf scene :root) ray))

(defun compute_color (scene ray) 
    (let ((hit (hit_in_scene scene ray)))
        (if hit 
            (c_mul_s 
                (getf (getf hit :material) :color)
                (compute_light 
                    (getf scene :lights) 
                    hit 
                    (vec3_inv (getf  ray :direction)))) 
            (Color 1 1 1))))

(defun render_pixel (scene u v width)
    (compute_color 
        scene 
        (Ray 
            (getf (getf scene :camera) :position) 
            (v3_mul_v3 
                (Vector3 
                    (- (/ u width) 0.5) 
                    (- (/ v width) 0.5) 
                    1) 
                (getf (getf scene :camera) :view_port)))))

(defun render_scene (scene width height draw_pixel)
    (dotimes (v height)
        (dotimes (u width)
            (let ((color (render_pixel scene u v width)))
                (funcall draw_pixel u v color)))))

(load "./scenes/scene1.cl")
(let 
    (
        (width 640) 
        (height 480)) 
    (render_scene scene width height (symbol-function 'draw_pixel_dummy)))
    