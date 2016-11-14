$(function() {
  $('#search').keyup(function() {
    let search_term = $(this).val();
    $.ajax({
      method: 'POST',
      url: '/api/search',
      data: {
        search_term
      },
      dataType: 'json',
      success: function(json) {
        let data = json.hits.hits.map(function(hit) {
          return hit;
        });
        console.log(data);
        $('#searchResults').empty();

        for (let i = 0; i < data.length; i++) {
          let html = '';
          html += '<div class="col-md-4">';
          html += '<a href="/product/' + data[i]._source._id + '">';
          html += '<div class="thumbnail">';
          html += '<img src="' + data[i]._source.image + '">';
          html += '<div class="caption">';
          html += '<h3>' + data[i]._source.name + '</h3>';
          html += '<p>' + data[i]._source.category.name + '</p>';
          html += '<p>' + data[i]._source.price + '</p>';
          html += '</div></div></a></div>';

          $('#searchResults').append(html);
        }
      },
      error: function(error) {
        console.log(err);
      }
    });
  });
});