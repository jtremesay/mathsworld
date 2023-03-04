(define-class Color Object
    (constructor (lambda (self r g b) 
        (begin
            (set-obj! self '_r r)
            (set-obj! self '_g g)
            (set-obj! self '_b b))))
    (to-style (lambda (self)
        (format "rgb(~s, ~s, ~s)" self._r self._g self._b))))

(define color (lambda (r g b) (new Color r g b)))

(define-class Vector3 Object
    (constructor (lambda (self x y z) 
        (begin
            (set-obj! self '_x x)
            (set-obj! self '_y y)
            (set-obj! self '_z z)))))

(define mult_vec (lambda (self o) 
        (vector3 
            (* self._x o._x) 
            (* self._y o._y) 
            (* self._z o._z))))

(define vector3 (lambda (x y z) (new Vector3 x y z)))

(define-class Camera Object
    (constructor (lambda (self position view_port) 
        (begin
            (set-obj! self '_position position)
            (set-obj! self '_view_port view_port)))))

(define camera (lambda (position view_port) (new Camera position view_port)))

(define-class Material Object
    (constructor (lambda (self color specular) 
        (begin
            (set-obj! self '_color color)
            (set-obj! self '_specular specular)))))

(define material (lambda (color specular) (new Material color specular)))

(define-class Sphere Object
    (constructor (lambda (self position radius material) 
        (begin
            (set-obj! self '_position position)
            (set-obj! self '_radius radius)
            (set-obj! self '_material material)))))


(define sphere (lambda (position radius material) (new Sphere position radius material)))

(define-class Union Object
    (constructor (lambda (self nodes) 
        (begin
            (set-obj! self '_nodes nodes)))))

(define union (lambda (nodes) (new Union nodes)))

(define-class AmbiantLight Object
    (constructor (lambda (self intensity) 
        (begin
            (set-obj! self '_intensity intensity)))))

(define ambiant (lambda (intensity) (new AmbiantLight intensity)))

(define-class OmniDirectionalLight Object
    (constructor (lambda (self intensity position) 
        (begin
            (set-obj! self '_intensity intensity)
            (set-obj! self '_position position)))))

(define omnidirectional (lambda (intensity position) (new OmniDirectionalLight intensity position)))

(define-class DirectionalLight Object
    (constructor (lambda (self intensity direction) 
        (begin
            (set-obj! self '_intensity intensity)
            (set-obj! self '_direction direction)))))

(define directional (lambda (intensity direction) (new DirectionalLight intensity direction)))

(define-class Scene Object
    (constructor (lambda (self camera root lights) 
        (begin
            (set-obj! self '_camera camera)
            (set-obj! self '_root root)
            (set-obj! self '_lights lights)))))

(define scene (lambda (camera root lights) (new Scene camera root lights)))

(define draw-pixel (lambda (ctx x y color) 
    (begin 
        (set! ctx.fillStyle (color.to-style))
        (ctx.fillRect x y 1 1))))

(define render-pixel (lambda (s ctx u v width) 
    (let ((c s.camera)) 
        (let ((vp s.view_port))
            (let ((direction  (mult_vec (vector3 0 0 0) vp)))
                (draw-pixel ctx u v (color (* (/ u width) 255)  (* (/ v width) 255) 255)))))))

(define render-scene (lambda (scene canvas ctx) 
    (do-iterator 
        (v (range canvas.height)) 
        ()
        (do-iterator 
            (u (range canvas.width)) 
            ()
            (render-pixel scene ctx u v canvas.width)))))

(let 
    (
        (scene_editor_node (document.getElementById "scene"))
        (canvas_node (document.getElementById "canvas")))
    (let 
        (
            (s (lips.exec scene_editor_node.value))
            (ctx (canvas_node.getContext "2d")))
        (begin
            (print s)
            (render-scene s canvas ctx)
            )))