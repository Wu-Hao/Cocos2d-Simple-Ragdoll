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

var MyLayer = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    init:function () {
        this._super();

        var size = cc.Director.getInstance().getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        /*var closeItem = cc.MenuItemImage.create(
            "res/CloseNormal.png",
            "res/CloseSelected.png",
            this,
            this.addSuperHeavy);
        closeItem.setAnchorPoint(cc.p(0.5, 0.5));

        var menu = cc.Menu.create(closeItem, null);
        menu.setPosition(cc.PointZero());
        this.addChild(menu, 1);
        closeItem.setPosition(cc.p(size.width - 20, 20));*/

        this.setTouchEnabled(true);
        this.world = new Box2D.b2World(new Box2D.b2Vec2(0,-10));
        this.world.SetContinuousPhysics(true);
        //this.listender = new Box2D.b2ContactListener();
        var bd_ground = new Box2D.b2BodyDef();

        var temp = cc.Sprite.create("res/Icon.png");
        this.size = temp.getContentSize().width;
        console.log(this.size);
        bd_ground.set_position(new Box2D.b2Vec2(cc.canvas.width/2/this.size, cc.canvas.height/2/this.size));
        this.ground = this.world.CreateBody(bd_ground);
        var groundbox = new Box2D.b2PolygonShape();
        //bottom
        groundbox.SetAsBox(cc.canvas.width/2/this.size, 0 , new Box2D.b2Vec2(0, -cc.canvas.height/2/this.size), 0);
        this.ground.CreateFixture(groundbox,0);


        //left
        groundbox.SetAsBox(0, cc.canvas.height/2/this.size, new Box2D.b2Vec2(-cc.canvas.width/2/this.size, 0),0);
        this.ground.CreateFixture(groundbox,0);

        //right
        groundbox.SetAsBox(0, cc.canvas.height/2/this.size, new Box2D.b2Vec2(cc.canvas.width/2/this.size, 0), 0);
        this.ground.CreateFixture(groundbox,0);

        //top
        groundbox.SetAsBox(cc.canvas.width/2/this.size, 0, new Box2D.b2Vec2(0, cc.canvas.height/2/this.size), 0);
        this.ground.CreateFixture(groundbox,0);

        this.scheduleUpdate();
        this.addPhysicsBody(cc.p(cc.canvas.width/2, cc.canvas.height/2));
        return true;
    },
    ballshape:new Box2D.b2CircleShape(),
    boxshape:new Box2D.b2PolygonShape(),
    boxFix:new Box2D.b2FixtureDef(),
    ballFix: new Box2D.b2FixtureDef(),
    boxDef:new Box2D.b2BodyDef(),

    ctor:function(){
        this.ballshape.set_m_radius(0.6);
        this.boxshape.SetAsBox(0.5,0.5);
        this.boxFix.set_shape(this.boxshape);
        this.boxFix.set_density(5.0);
        this.boxFix.set_friction(0.8);
        this.boxFix.set_restitution(0.2);

        this.ballFix.set_shape(this.ballshape);
        this.ballFix.set_density(1.0);
        this.ballFix.set_friction(1);
        this.ballFix.set_restitution(1);


        //this.boxDef
    },
    onTouchesEnded:function(touches, event){
        this.addGrossini(touches[0].getLocation());
    },
    addPhysicsBody:function(pos)
    {
        //var box = cc.LayerColor.create(cc.c3b(255,255,0,255), 50, 50);
        var box = cc.Sprite.create("res/Icon.png");
        box.setPosition(pos);
        //box.setContentSize(cc.SizeMake(this.size,this.size));
        this.addChild(box);

        var bodyDef = new Box2D.b2BodyDef();
        bodyDef.set_type(Box2D.b2_dynamicBody);
        bodyDef.set_position(new Box2D.b2Vec2(pos.x/this.size, pos.y/this.size));
        var body = this.world.CreateBody(bodyDef);
        body.userData = box;

        body.CreateFixture(this.boxFix);
    },
    addGrossini:function(pos){
        var gros = new Grossini();
        gros.spawn(pos, this);
    },
    update:function(dt){
        dt = dt>0.2? 0.1:dt;
        this.world.Step(dt, 4,1);
        for(var b = this.world.GetBodyList(); b; b= b.GetNext())
        {
            if(b.userData)
            {
                var sprite = b.userData;
                sprite.setPosition(cc.p(b.GetPosition().get_x()*this.size, b.GetPosition().get_y()*this.size));
                sprite.setRotation(-1*cc.RADIANS_TO_DEGREES(b.GetAngle()));
            }
            else{
                break;
            }
        }
    }

});

var Grossini = cc.Class.extend({
    ctor:function(){
        var ran = 0|(Math.random()*10);
        this.head = cc.Sprite.create('res/head'+ran+'.png');
        this.leftArm = cc.Sprite.create('res/leftarm.png');
        this.rightArm = cc.Sprite.create('res/rightarm.png');
        this.body = cc.Sprite.create('res/body.png');
        this.leftLeg = cc.Sprite.create('res/leftleg.png');
        this.rightLeg = cc.Sprite.create('res/rightleg.png');

        this.head.setPosition(cc.p(this.body.getContentSize().width/2, 55));
        this.leftArm.setPosition(cc.p(-2, 15));
        this.rightArm.setPosition(cc.p(this.body.getContentSize().width+2, 15));
        this.leftLeg.setPosition(cc.p(7, -14));
        this.rightLeg.setPosition(cc.p(23, -14));
        this.groupIndex = (0|(Math.random()*999));
        this.groupIndex = -this.groupIndex;
    },
    getFixFor:function(x){
        switch (x){
            case 'body':
                if(!Grossini.bodyFix)
                {
                    var shape = new Box2D.b2PolygonShape();
                    shape.SetAsBox(0.2017,0.2807);
                    this.bodyFix = new Box2D.b2FixtureDef();
                    this.bodyFix.set_shape(shape);
                    this.bodyFix.set_density(1);
                    this.bodyFix.set_friction(0.5);
                    this.bodyFix.set_restitution(2);
                    this.bodyFix.get_filter().set_groupIndex(this.groupIndex);
                }
                return this.bodyFix;
            case 'head':
                if(!this.headFix)
                {
                    var shape = new Box2D.b2PolygonShape();
                    shape.SetAsBox(0.2719,0.3158);
                    this.headFix = new Box2D.b2FixtureDef();
                    this.headFix.set_shape(shape);
                    this.headFix.set_density(0.5);
                    this.headFix.set_friction(0.2);
                    this.headFix.set_restitution(2);
                    this.headFix.get_filter().set_groupIndex(this.groupIndex);
                }
                return this.headFix;
            case 'lArm':
                if(!this.lArmFix)
                {
                    var shape = new Box2D.b2PolygonShape();
                    shape.SetAsBox(0.07895,0.32456);
                    this.lArmFix = new Box2D.b2FixtureDef();
                    this.lArmFix.set_shape(shape);
                    this.lArmFix.set_density(1);
                    this.lArmFix.set_friction(0.2);
                    this.lArmFix.set_restitution(2);
                    this.lArmFix.get_filter().set_groupIndex(this.groupIndex);
                }
                return this.lArmFix;
            case 'lleg':
                if(!this.llegFix)
                {
                    var shape = new Box2D.b2PolygonShape();
                    shape.SetAsBox(0.114,0.315789);
                    this.llegFix = new Box2D.b2FixtureDef();
                    this.llegFix.set_shape(shape);
                    this.llegFix.set_density(1);
                    this.llegFix.set_friction(0.0);
                    this.llegFix.set_restitution(2);
                    this.llegFix.get_filter().set_groupIndex(this.groupIndex);
                }
                return this.llegFix;
        }
    },
    createPart:function(pos, layer){
        var part = new Box2D.b2BodyDef();
        part.set_type(Box2D.b2_dynamicBody);
        part.set_position(new Box2D.b2Vec2(pos.x/layer.size, pos.y/layer.size));
        part.set_bullet(true);
        var ret = layer.world.CreateBody(part);
        return ret;
    },
    spawn:function(pos, layer){
        //spawn at this location
        layer.addChild(this.body);
        layer.addChild(this.head);
        layer.addChild(this.leftArm);
        layer.addChild(this.rightArm);
        layer.addChild(this.leftLeg);
        layer.addChild(this.rightLeg);

        this.body.setPosition(pos);
        //create body box
        var body = this.createPart(pos, layer);
        body.userData = this.body;
        var bodyfix = this.getFixFor('body');
        body.CreateFixture(bodyfix);

        var head = this.createPart(cc.pAdd(pos, cc.p(0, 37)),layer);
        head.userData = this.head;
        head.CreateFixture(this.getFixFor('head'));

        //join head and body
        var jd = new Box2D.b2RevoluteJointDef();
        jd.set_enableLimit(true);
        jd.set_lowerAngle(cc.DEGREES_TO_RADIANS(-50));
        jd.set_upperAngle(cc.DEGREES_TO_RADIANS(50));
        var b2anchor = new Box2D.b2Vec2(pos.x/layer.size, (pos.y+22)/layer.size);
        jd.Initialize(body,head, b2anchor);
        layer.world.CreateJoint(jd);

        //leftarm
        var leftArm = this.createPart(cc.pAdd(pos, cc.p(-12,0)),layer);
        leftArm.userData = this.leftArm;
        var larmfix = this.getFixFor('lArm');
        leftArm.CreateFixture(larmfix);

        //join larm and body
        var jd2 = new Box2D.b2RevoluteJointDef();
        jd2.set_enableLimit(true);
        jd2.set_lowerAngle(cc.DEGREES_TO_RADIANS(-179));
        jd2.set_upperAngle(cc.DEGREES_TO_RADIANS(50));
        var b2anchor2 = new Box2D.b2Vec2((pos.x-15)/layer.size, (pos.y+14)/layer.size);
        jd2.Initialize(body,leftArm, b2anchor2);
        layer.world.CreateJoint(jd2);

        //rightarm
        var rightArm = this.createPart(cc.pAdd(pos, cc.p(12,0)),layer);
        rightArm.userData = this.rightArm;
        rightArm.CreateFixture(this.getFixFor('lArm'));

        //join rArm and body
        var jd3 = new Box2D.b2RevoluteJointDef();
        jd3.set_enableLimit(true);
        jd3.set_lowerAngle(cc.DEGREES_TO_RADIANS(-50));
        jd3.set_upperAngle(cc.DEGREES_TO_RADIANS(179));
        var b2anchor3 = new Box2D.b2Vec2((pos.x+15)/layer.size, (pos.y+14)/layer.size);
        jd3.Initialize(body,rightArm, b2anchor3);
        layer.world.CreateJoint(jd3);

        //left leg
        var leftLeg = this.createPart(cc.pAdd(pos, cc.p(-8,-35)),layer);
        leftLeg.userData = this.leftLeg;
        leftLeg.CreateFixture(this.getFixFor('lleg'));

        //join lleg and body
        var jd4 = new Box2D.b2RevoluteJointDef();
        jd4.set_enableLimit(true);
        jd4.set_lowerAngle(cc.DEGREES_TO_RADIANS(-70));
        jd4.set_upperAngle(cc.DEGREES_TO_RADIANS(30));
        var b2anchor4 = new Box2D.b2Vec2((pos.x-8)/layer.size, (pos.y-15)/layer.size);
        jd4.Initialize(body,leftLeg, b2anchor4);
        layer.world.CreateJoint(jd4);

        //right leg
        var rightleg = this.createPart(cc.pAdd(pos, cc.p(8,-35)),layer);
        rightleg.userData = this.rightLeg;
        rightleg.CreateFixture(this.getFixFor('lleg'));

        //join rleg and body
        var jd5 = new Box2D.b2RevoluteJointDef();
        jd5.set_enableLimit(true);
        jd5.set_lowerAngle(cc.DEGREES_TO_RADIANS(-30));
        jd5.set_upperAngle(cc.DEGREES_TO_RADIANS(70));
        var b2anchor5 = new Box2D.b2Vec2((pos.x+8)/layer.size, (pos.y-15)/layer.size);
        jd5.Initialize(body,rightleg, b2anchor5);
        layer.world.CreateJoint(jd5);
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
