        var r = 20;
        var w = r*2*(Math.sqrt(3)/2);
        var ctx;
        var sel = [-1, -1];
        var board = new Array(14);
        var hist = [];
        var player = 0;
        var multiplayer = false;
        var active = true;

        function drawHexagon(c, x, y, r)
        {
            c.beginPath();
            c.moveTo(x, y-r);
            for(var i=0; i<6; i++)
                c.lineTo(x+r*Math.cos(Math.PI*(1.5+1/3*i)), y+r*Math.sin(Math.PI*(1.5+1/3*i)));
            c.closePath();
            c.fill();
            c.stroke();
        }

        function drawPath(c, p)
        {
            c.lineWidth = 10;
            c.beginPath();
            c.moveTo((p[0][0]+p[0][1])*w - (p[0][1]-4)*(w/2), (p[0][1]+2)*1.5*r);
            for(var i=1; i<p.length; i++)
                c.lineTo((p[i][0]+p[i][1])*w - (p[i][1]-4)*(w/2), (p[i][1]+2)*1.5*r);
            c.stroke();
        }

        function getSel(e)
        {
            var color = ctx.getImageData(e.clientX-20, e.clientY, 1, 1).data;
            color[0] -= color[2]==38||color[2]==178 ? 241 : 0;
            color[1] -= color[2]==178 ? 220 : (color[2]==38 ? 0 : 140);
            if(color[0] >= 0  &&  color[0] <= 13  &&  color[1] >= 0  &&  color[1] <= 13  &&  (color[2] == 38  ||  color[2] == 171  ||  color[2] == 178))
                sel = [color[0], color[1]];
            else
                sel = [-1, -1];
        }

        function aiMove()
        {
            var pos;
            do
                pos = [Math.floor(Math.random()*14), Math.floor(Math.random()*14)];
            while(board[pos[0]][pos[1]] != -1);
            hist.push([pos[0],pos[1],1]);
            board[pos[0]][pos[1]] = 1;
        }

        function findArr(a, b)
        {
            for(var i=0; i<a.length; i++)
                if(JSON.stringify(a[i]) == JSON.stringify(b))
                    return i;
            return -1;
        }

        function getConnections(x, y, c, open, closed)
        {
            var a = [-1, 0, 1, 0, 0, -1, 0, 1, 1, -1, -1, 1];
            var ret = [];
            for(var i=0; i<6; i++)
                if(x+a[i*2] >= 0  &&  x+a[i*2] < 14  &&  y+a[i*2+1] >= 0  &&  y+a[i*2+1] < 14)
                    if(board[x+a[i*2]][y+a[i*2+1]] == c  &&  findArr(open, [x+a[i*2],y+a[i*2+1]]) == -1  &&  findArr(closed, [x+a[i*2],y+a[i*2+1]]) == -1)
                        ret.push([x+a[i*2],y+a[i*2+1]]);
            return ret;
        }

        function checkWin(c)
        {
            var open = [], openPrev = [], closed = [], closedPrev = [];
            for(var a=0; a<14; a++)
            {
                if(board[c==0?a:0][c==0?0:a] == c)
                {
                    open.length = openPrev.length = closed.length = closedPrev.length = 0;
                    var pathFound = false;
                    open.push([c==0?a:0, c==0?0:a]);
                    openPrev.push(-1);
                    while(open.length > 0)
                    {
                        var u = open[0];
                        open.splice(0, 1);
                        var uI = openPrev.splice(0, 1);
                        closed.push(u);
                        closedPrev.push(uI);
                        if(u[c==0?1:0] == 13)
                        {
                            pathFound = true;
                            break;
                        }
                        var connections = getConnections(u[0], u[1], c, open, closed);
                        for(var i=0; i<connections.length; i++)
                        {
                            open.push(connections[i]);
                            openPrev.push(closed.length-1);
                        }
                    }
                    if(pathFound)
                    {
                        var path = [];
                        var u = closed.length-1;
                        while(closedPrev[u] != -1)
                        {
                            path.push(closed[u]);
                            u = closedPrev[u];
                        }
                        path.push([c==0?a:0, c==0?0:a]);
                        path.reverse();
                        active = false;
                        return path;
                    }
                }
            }
            return false;
        }

        function mouseDown(e)
        {
            getSel(e);
            if(active)
            {
                if(sel[0] != -1  &&  sel[1] != -1)
                {
                    hist.push([sel[0],sel[1],player]);
                    board[sel[0]][sel[1]] = player;
                    if(multiplayer)
                        player = player==0 ? 1 : 0;
                    else
                        aiMove();
                    draw();
                    var p0 = checkWin(0), p1 = checkWin(1);
                    if(p0 != false)
                        { drawPath(ctx, p0); alert((multiplayer?"The red player":"You") + " won!"); }
                    else if(p1 != false)
                        { drawPath(ctx, p1); alert((multiplayer?"The blue player":"The computer") + " won!"); }
                }
            }
        }

        function mouseMove(e)
        {
            getSel(e);
            if(active)
                draw();
        }

        function draw()
        {
            ctx.clearRect(0, 0, 850, 600);
            ctx.lineWidth = 1;

            ctx.fillStyle = "rgb(0,154,172)";
            ctx.beginPath();
            ctx.moveTo(w*15.65, r);
            ctx.lineTo(w*23.5, 24.5*r);
            ctx.lineTo(0, r);
            ctx.lineTo(w*7.85, 24.5*r);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgb(255,0,39)";
            ctx.beginPath();
            ctx.moveTo(0, r);
            ctx.lineTo(w*15.65, r);
            ctx.lineTo(w*7.85, 24.5*r);
            ctx.lineTo(w*23.5, 24.5*r);
            ctx.closePath();
            ctx.fill();

            var num = 0;
            ctx.strokeStyle = "white";
            for(var y=0; y<14; y++)
            {
                for(var x=0; x<14; x++)
                {
                    if(board[x][y] == 0)
                        ctx.fillStyle = "rgb(255,0,39)";
                    else if(board[x][y] == 1)
                        ctx.fillStyle = "rgb(0,154,172)";
                    else if(x == sel[0]  &&  y == sel[1])
                        ctx.fillStyle = "rgb(" + (x+(player==0?241:0)) + "," + (y+(player==0?0:140)) + "," + (player==0?38:171) + ")";
                    else
                        ctx.fillStyle = "rgb(" + (x+241) + "," + (y+220) + ",178)";
                    drawHexagon(ctx, (x+y)*w - (y-4)*(w/2), (y+2)*1.5*r, r);
                    num++;
                }
            }
        }

        function chgMP()
        {
            multiplayer = !multiplayer;
            player = 0;
            init();
        }

        function undo()
        {
            if(active)
            {
                var a;
                if(hist.length > 0)
                {
                    a = hist[hist.length-1];
                    board[a[0]][a[1]] = -1;
                    hist.pop();
                }
                if(!multiplayer)
                {
                    a = hist[hist.length-1];
                    board[a[0]][a[1]] = -1;
                    hist.pop();
                }
                player = a[2];
                draw();
            }
        }

        function init()
        {
            for(var i=0; i<14; i++)
            {
                board[i] = new Array(14);
                for(var j=0; j<14; j++)
                    board[i][j] = -1;
            }
            hist.length = 0;
            active = true;
            draw();
        }

        function load()
        {
            var canvas = document.getElementById("output");
            ctx = canvas.getContext("2d");
            document.getElementById("mp").checked = false;
            canvas.onmousedown = mouseDown;
            canvas.onmousemove = mouseMove;
            init();
        }