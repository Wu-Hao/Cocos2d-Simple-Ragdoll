/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var Space = new cp.Space();
Space.iterations = 5;
Space.gravity = cp.v(0, -750);
var CPSprite = cc.Sprite.extend({
    ctor:function(filename, pos, mass, Elasticity, friction){
        this.initWithFile(filename);
        mass = mass || 5;
        var body = Space.addBody(new cp.Body(mass, cp.momentForBox(mass, this.getContentSize().width, this.getContentSize().height)));
        body.setPos(cp.v(pos.x, pos.y));
        var shape = Space.addShape(new cp.BoxShape(body, this.getContentSize().width, this.getContentSize().height));
        shape.setElasticity(Elasticity || 0.2);
        shape.setFriction(friction || 0.8);
        this.body = body;
        this.shape = shape;
    },
    visit:function(){
        if(this.body)
        {
            var pos = this.body.p;
            this.setPosition(pos.x, pos.y);
            this.setRotation(cc.RADIANS_TO_DEGREES(-1*this.body.a));
        }
        else{
            console.log('no body?');
        }
        this._super();
    }
});


var MyLayer = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    init:function () {
        this._super();
        var thickness = 50;
        this.setTouchEnabled(true);
        //add floor
        var floor = Space.addShape(new cp.SegmentShape(Space.staticBody, cp.v(0,0-thickness), cp.v(cc.canvas.width,0-thickness), thickness));
        floor.setElasticity(1);
        floor.setFriction(1);
        var lwall = Space.addShape(new cp.SegmentShape(Space.staticBody, cp.v(0-thickness,cc.canvas.height), cp.v(0-thickness,0), thickness));
        var rwall = Space.addShape(new cp.SegmentShape(Space.staticBody, cp.v(cc.canvas.width+thickness, cc.canvas.height), cp.v(cc.canvas.width+thickness, 0),thickness));
        var ceiling = Space.addShape(new cp.SegmentShape(Space.staticBody, cp.v(0, cc.canvas.height+thickness), cp.v(cc.canvas.width, cc.canvas.height+thickness), thickness));
        lwall.setElasticity(1);
        lwall.setFriction(1);
        rwall.setElasticity(1);
        rwall.setFriction(1);
        ceiling.setElasticity(1);
        ceiling.setFriction(1);

        this.scheduleUpdate();
        this.addPhysicsBody(cc.p(cc.canvas.width/2, cc.canvas.height/2));
        return true;
    },


    onTouchesEnded:function(touches, event){
        this.addGrossini(touches[0].getLocation());
    },
    addPhysicsBody:function(pos)
    {
        //var box = cc.LayerColor.create(cc.c3b(255,255,0,255), 50, 50);
        var box = new CPSprite("res/Icon.png", pos);
        //box.setContentSize(cc.SizeMake(this.size,this.size));
        this.addChild(box);
    },
    count:0,
    addGrossini:function(pos){
        if(this.count < 15)
        {
            var gros = new Grossini(pos);
            gros.spawn(this);
            this.count ++;
        }
    },
    update:function(dt){
        dt = dt>0.2? 0.1:dt;
        Space.step(dt);
    }

});
function ArrayShuffle(arr){
    for (var i = arr.length - 1; i > 0; i--) {
        var j = 0|(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}
ArrayShuffle(heads);
var Grossini = cc.Class.extend({
    ctor:function(pos){
        if(Grossini.num<10)
        {
            var ran = heads[Grossini.num-1];
        }
        else{
            var ran = (0|(Math.random()*heads.length));
        }
        this.head = new CPSprite('res/head'+ran+'.png',cc.pAdd(pos, cc.p(0, 35.5)), 15, 1.4,0.2);
        this.leftArm = new CPSprite('res/leftarm.png', cc.pAdd(pos,cc.p(-29.87,11)), 2, 1.4, 0.2);
        this.rightArm = new CPSprite('res/rightarm.png', cc.pAdd(pos,cc.p(29.87,11)), 2,1.4,0.2);
        this.body = new CPSprite('res/body.png', pos, 12, 1, 0.5);
        this.leftLeg = new CPSprite('res/leftleg.png', cc.pAdd(pos,cc.p(-7,-32)), 5, 1.4, 0);
        this.rightLeg = new CPSprite('res/rightleg.png', cc.pAdd(pos,cc.p(7,-32)), 5,1.4,0);

        this.head.shape.group = Grossini.num;
        this.leftArm.shape.group = Grossini.num;
        this.rightArm.shape.group = Grossini.num;
        this.body.shape.group =Grossini.num;
        this.leftLeg.shape.group =Grossini.num;
        this.rightLeg.shape.group = Grossini.num;

        this.leftArm.setRotation(90);
        this.leftArm.body.setAngle(cc.DEGREES_TO_RADIANS(-90));

        this.rightArm.setRotation(-90);
        this.rightArm.body.setAngle(cc.DEGREES_TO_RADIANS(90));


        //add joints
        Space.addConstraint(new cp.PivotJoint(this.body.body, this.head.body, cp.v.add(cp.v(pos.x,pos.y),cp.v(-0.01, 23.0))));
        Space.addConstraint(new cp.DampedRotarySpring(this.body.body, this.head.body, 0, 1000000, 0));

        Space.addConstraint(new cp.PivotJoint(this.body.body, this.leftArm.body, cp.v.add(cp.v(pos.x,pos.y),cp.v(-13.5,11))));
        Space.addConstraint(new cp.RotaryLimitJoint(this.body.body, this.leftArm.body, cc.DEGREES_TO_RADIANS(-180), cc.DEGREES_TO_RADIANS(20)));

        Space.addConstraint(new cp.PivotJoint(this.body.body, this.rightArm.body, cp.v.add(cp.v(pos.x,pos.y),cp.v(13.5,11))));
        Space.addConstraint(new cp.RotaryLimitJoint(this.body.body, this.rightArm.body, cc.DEGREES_TO_RADIANS(-20), cc.DEGREES_TO_RADIANS(180)));

        Space.addConstraint(new cp.PivotJoint(this.body.body, this.leftLeg.body, cp.v.add(cp.v(pos.x,pos.y),cp.v(-6.5,-16))));
        Space.addConstraint(new cp.RotaryLimitJoint(this.body.body, this.leftLeg.body, cc.DEGREES_TO_RADIANS(-70), cc.DEGREES_TO_RADIANS(20)));
        Space.addConstraint(new cp.DampedRotarySpring(this.body.body, this.leftLeg.body, cc.DEGREES_TO_RADIANS(13), 500000, 10));


        Space.addConstraint(new cp.PivotJoint(this.body.body, this.rightLeg.body, cp.v.add(cp.v(pos.x,pos.y),cp.v(6.5,-16))));
        Space.addConstraint(new cp.RotaryLimitJoint(this.body.body, this.rightLeg.body, cc.DEGREES_TO_RADIANS(-20), cc.DEGREES_TO_RADIANS(70)));
        Space.addConstraint(new cp.DampedRotarySpring(this.body.body, this.rightLeg.body, cc.DEGREES_TO_RADIANS(-13), 500000, 10));




        Grossini.num++;

    },
    spawn:function(layer){
        //spawn at this location
        layer.addChild(this.leftLeg);
        layer.addChild(this.rightLeg);
       layer.addChild(this.body);
        layer.addChild(this.head);
        layer.addChild(this.leftArm);
        layer.addChild(this.rightArm);
    }
});
Grossini.num = 1;
var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
