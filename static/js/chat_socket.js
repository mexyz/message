loadRooms();
var socket = io.connect('http://172.16.2.237:3000');
if (!$.cookie('chat_nickname')) {
    $('#login-modal').modal('show');
} else {
    $('#my-nickname').html('昵称：' + $.cookie('chat_nickname'));
}

socket.on('connect',
function() {
    socket.emit('join', {
        userName: $.cookie('chat_nickname')
    });
});

socket.on('broadcast-join',
function(data) {
    if ($.cookie('chat_nickname')) {
        addServerMessage(getLocalHMS(), '[' + data.userName + '] 进入了聊天室。');
        getOnlineUser();
    }
    loadRooms();
});

socket.on('broadcast-quit',
function(data) {
    addServerMessage(getLocalHMS(), '[' + data.userName + '] 离开了聊天室。');
    getOnlineUser();
});

socket.on('broadcast-system',
function(_message) {
    addServerMessage(getLocalHMS(), _message);
});

socket.on('private-system-message',
function(_message) {
    addServerMessage(getLocalHMS(), _message);
});

socket.on('group',
function(data) {
    addMessage(data.nickName, getLocalHMS(), data.content);
    if ("hidden" == document[GetVisibilityKey()]) {
        Notify.show({
            icon: '/images/qx_chat.png',
            'title': '聊天室',
            'message': data.nickName + '：' + data.content,
            'autoclose': 3,
            'onclick': function() {
                window.focus();
                if (undefined !== typeof this.colse) {
                    this.close();
                } else if (undefined !== typeof this.cancel) {
                    this.cancel();
                }
            }
        });
    }
});

function changeNickname(_nickname) {
    $.ajax({
        url: "/chageNickName",
        type: "POST",
        dataType: "json",
        data: {
            "nickname": _nickname
        },
        success: function(data) {
            if (data.code == 1) {
                $.cookie('chat_nickname', _nickname);
                $('#login-modal').modal('hide');
                $('#my-nickname').html('昵称：' + _nickname);
                location.reload();
            } else {
                //$('#login-modal').modal('show');
                $("#nickname-error").text(data.msg);
                $("#nickname-error").show();
                $('#nickname-edit').focus();
            }
        }
    });

    //addServerMessage(getLocalHMS(), '[' + _nickname + '] 进入了聊天室。');
}

function getOnlineUser() {
    $.ajax({
        url: "/onlineUser",
        type: "GET",
        dataType: "json",
        success: function(data) {
            useUserList(data);
        }
    });
}

function say(_content) {
    socket.emit('group', {
        nickName: $.cookie('chat_nickname'),
        content: _content
    });
}

function loadRooms() {
	$(".room-list-body").empty();
    $.ajax({
        url: "/json/rooms.json",
        type: "GET",
        dataType: "json",
        success: function(rooms) {
            var urls = location.href.split("/");
            var cRoomId = urls[urls.length - 1];
            if (isNaN(cRoomId)) {
            	cRoomId = 0;
            }
            
            $.ajax({
                url: "/chatRoomOnline",
                type: "GET",
                dataType: "json",
                success: function(data) {
                	$(rooms.rooms).each(function(i, n) {
                		var roomId=n.id;
                		var count=0;
                		if(data["ChatRoom-"+n.id]){
                			count=data["ChatRoom-"+n.id].length;
                		}
                		if (cRoomId == 0 && i == 0) {
                            $(".room-list-body").append('<a href="javascript:void(0)" onclick="joinRoom(' + i + ',' + roomId + ')" class="list-group-item active"><span class="badge pull-right">'+count+'</span>' + n.name + '</a>');
                        } else if (n.id == cRoomId) {
                            $(".room-list-body").append('<a href="javascript:void(0)" onclick="joinRoom(' + i + ',' + roomId + ')" class="list-group-item active"><span class="badge pull-right">'+count+'</span>' + n.name + '</a>');
                            changeChatRoomName(n.name);
                            $("#onlineUserList").html("");
                            for (var i = 0; i < count; i++) {
                                addUserToList(data["ChatRoom-"+n.id][i]);
                            }
                            updateListCount();
                        } else {
                            $(".room-list-body").append('<a href="javascript:void(0)" onclick="joinRoom(' + i + ',' + roomId + ')" class="list-group-item"><span class="badge pull-right">'+count+'</span>' + n.name + '</a>');
                        }
                    });
                    
                }
            });
            
            

        }
    });
}

function joinRoom(index, id) {
    $(".room-list-body a").each(function(i, n) {
        if (i == index) {
            $(n).addClass("active");
        } else {
            $(n).removeClass("active");
        }
    });

    location.href = "http://" + location.host + "/chatRoom/" + id;

}